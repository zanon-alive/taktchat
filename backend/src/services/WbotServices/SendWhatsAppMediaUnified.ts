import * as Sentry from "@sentry/node";
import fs from "fs";
import path from "path";
import AppError from "../../errors/AppError";
import { GetTicketAdapter } from "../../helpers/GetWhatsAppAdapter";
import Ticket from "../../models/Ticket";
import Contact from "../../models/Contact";
import formatBody from "../../helpers/Mustache";
import logger from "../../utils/logger";
import { IWhatsAppMessage } from "../../libs/whatsapp";
import {
  getContactChatJid,
  resolveOutboundChatJid,
  toWhatsAppAdapterAddress
} from "../../helpers/whatsappJid";

interface Request {
  media: Express.Multer.File;
  ticket: Ticket;
  body?: string;
  isPrivate?: boolean;
  isForwarded?: boolean;
}

/**
 * Serviço unificado de envio de mídia WhatsApp
 * Suporta Baileys e Official API
 * 
 * Tipos de mídia suportados:
 * - Imagem: jpg, jpeg, png, gif, webp
 * - Áudio: mp3, ogg, aac, opus
 * - Vídeo: mp4, 3gp, avi, mov
 * - Documento: pdf, doc, docx, xls, xlsx, ppt, pptx, txt, zip
 */
const SendWhatsAppMediaUnified = async ({
  media,
  ticket,
  body,
  isPrivate = false,
  isForwarded = false
}: Request): Promise<IWhatsAppMessage | any> => {
  
  try {
    logger.info(`[SendMediaUnified] Enviando mídia para ticket ${ticket.id}`);
    
    // Obter adapter apropriado
    const adapter = await GetTicketAdapter(ticket);
    const channelType = adapter.channelType;
    
    logger.debug(`[SendMediaUnified] Tipo: ${media.mimetype}, Canal: ${channelType}`);
    
    // Obter contato
    const contact = await Contact.findByPk(ticket.contactId);
    if (!contact) {
      throw new AppError("ERR_CONTACT_NOT_FOUND", 404);
    }

    // Determinar número de destino
    let number: string;
    if (channelType === "official") {
      number =
        getContactChatJid(contact, ticket.isGroup) ||
        `${contact.number}@s.whatsapp.net`;
    } else {
      number =
        (await resolveOutboundChatJid(ticket, contact)) ||
        `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`;
    }
    const to = toWhatsAppAdapterAddress(number, channelType);

    // Determinar tipo de mídia baseado no mimetype
    let mediaType: "image" | "audio" | "video" | "document" = "document";
    
    if (media.mimetype.startsWith("image/")) {
      mediaType = "image";
    } else if (media.mimetype.startsWith("audio/")) {
      mediaType = "audio";
    } else if (media.mimetype.startsWith("video/")) {
      mediaType = "video";
    }

    // Formatar corpo da mensagem (caption)
    const formattedBody = body ? formatBody(body, ticket) : undefined;

    let sentMessage: IWhatsAppMessage;

    // ===== BAILEYS: Envia arquivo local =====
    if (channelType === "baileys") {
      // Caminho completo do arquivo
      const publicPath = path.join(
        process.cwd(),
        "public",
        `company${ticket.companyId}`,
        media.filename
      );

      if (!fs.existsSync(publicPath)) {
        throw new AppError(`Arquivo não encontrado: ${publicPath}`, 404);
      }

      // Ler arquivo
      const fileBuffer = fs.readFileSync(publicPath);
      const base64File = fileBuffer.toString("base64");
      const dataUri = `data:${media.mimetype};base64,${base64File}`;

      sentMessage = await adapter.sendMessage({
        to,
        mediaUrl: dataUri,
        mediaType,
        caption: formattedBody,
        filename: media.originalname
      });
    } 
    // ===== OFFICIAL API: Precisa de URL pública =====
    else if (channelType === "official") {
      // Construir URL pública do arquivo
      const backendUrl = process.env.BACKEND_URL || "http://localhost:8080";
      const mediaUrl = `${backendUrl}/public/company${ticket.companyId}/${media.filename}`;

      logger.info(`[SendMediaUnified] URL pública da mídia: ${mediaUrl}`);

      sentMessage = await adapter.sendMessage({
        to,
        mediaUrl,
        mediaType,
        caption: formattedBody,
        filename: media.originalname
      });
    } else {
      throw new AppError(`Tipo de canal não suportado: ${channelType}`, 400);
    }

    // Salvar mensagem no banco (para API Oficial e Baileys)
    if (channelType === "official") {
      const CreateMessageService = require("../MessageServices/CreateMessageService").default;
      
      // Extrair ID da mensagem
      let messageId: string;
      if ('id' in sentMessage) {
        messageId = sentMessage.id;
      } else if ((sentMessage as any).key?.id) {
        messageId = (sentMessage as any).key.id;
      } else {
        messageId = `${Date.now()}`;
      }
      
      // Determinar mediaType
      let mediaTypeDb = "document";
      if (mediaType === "image") mediaTypeDb = "image";
      else if (mediaType === "video") mediaTypeDb = "video";
      else if (mediaType === "audio") mediaTypeDb = "audio";
      
      // Salvar no banco
      await CreateMessageService({
        messageData: {
          wid: messageId,
          ticketId: ticket.id,
          contactId: ticket.contactId,
          body: formattedBody || media.originalname,
          fromMe: true,
          mediaType: mediaTypeDb,
          mediaUrl: `contact${ticket.contactId}/${media.filename}`, // Incluir contactId no caminho
          read: true,
          ack: 1,
          remoteJid: ticket.contact?.remoteJid,
        },
        companyId: ticket.companyId
      });
      
      logger.info(`[SendMediaUnified] Mensagem de mídia salva no banco: ${messageId}`);
    }
    
    // Atualizar última mensagem do ticket
    const lastMessage = formattedBody || `📎 ${media.originalname}`;
    await ticket.update({
      lastMessage,
      imported: null
    });

    logger.info(`[SendMediaUnified] Mídia enviada com sucesso para ticket ${ticket.id}`);

    return sentMessage;

  } catch (error: any) {
    Sentry.captureException(error);
    logger.error(`[SendMediaUnified] Erro ao enviar mídia: ${error.message}`);
    
    if (error instanceof AppError) {
      throw error;
    }
    
    throw new AppError(
      error.message || "ERR_SENDING_MEDIA_MSG",
      error.statusCode || 500
    );
  }
};

export default SendWhatsAppMediaUnified;
