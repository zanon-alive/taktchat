import { Request, Response } from "express";
import * as Yup from "yup";
import { Op } from "sequelize";
import Contact from "../models/Contact";
import Company from "../models/Company";
import Tag from "../models/Tag";
import ContactTag from "../models/ContactTag";
import Ticket from "../models/Ticket";
import ContactCustomField from "../models/ContactCustomField";
import logger from "../utils/logger";
import AppError from "../errors/AppError";
import SendWelcomeMessageService from "../services/LeadService/SendWelcomeMessageService";
import GetDefaultWhatsApp from "../helpers/GetDefaultWhatsApp";
import GetChannelEntryConfigService from "../services/ChannelEntryConfigService/GetChannelEntryConfigService";
import FindOrCreateTicketService from "../services/TicketServices/FindOrCreateTicketService";
import CreateMessageService from "../services/MessageServices/CreateMessageService";
import { safeNormalizePhoneNumber } from "../utils/phone";
import { format } from "date-fns";
import { v4 as uuidv4 } from "uuid";
import CompaniesSettings from "../models/CompaniesSettings";

interface LeadData {
  name: string;
  email: string;
  phone: string;
  company?: string;
  message?: string;
  source?: string;
}

const OPEN_TICKET_STATUSES = ["open", "pending", "bot", "lgpd"];

function shouldReplaceName(currentName: string | null | undefined, fallbackNumber: string): boolean {
  const normalized = (currentName || "").trim();
  if (!normalized) return true;
  const digitsOnly = normalized.replace(/\D/g, "");
  return digitsOnly === fallbackNumber;
}

export const store = async (req: Request, res: Response): Promise<Response> => {
  const schema = Yup.object().shape({
    name: Yup.string().required("Nome é obrigatório"),
    email: Yup.string().email("Email inválido").required("Email é obrigatório"),
    phone: Yup.string().required("Telefone é obrigatório"),
    company: Yup.string().nullable(),
    message: Yup.string().max(500, "Mensagem muito longa").nullable(),
    source: Yup.string().oneOf(["lead", "revendedor"]).nullable()
  });

  let leadData: LeadData;
  try {
    leadData = await schema.validate(req.body);
  } catch (err: any) {
    throw new AppError(err.message);
  }

  const source = leadData.source || "lead";
  const tagNameBySource = source === "revendedor" ? "Revendedor" : "Lead";

  try {
    let company = await Company.findOne({ order: [["id", "ASC"]] });
    if (!company) {
      logger.warn("Nenhuma empresa encontrada para salvar lead");
      return res.status(400).json({ error: "Sistema não configurado corretamente" });
    }

    const cleanedPhone = leadData.phone.replace(/\D/g, "");
    const { canonical } = safeNormalizePhoneNumber(cleanedPhone);
    if (!canonical) {
      throw new AppError("Número de telefone inválido");
    }

    const existingContact = await Contact.findOne({
      where: {
        companyId: company.id,
        [Op.or]: [
          { canonicalNumber: canonical },
          { number: canonical }
        ]
      }
    });

    const settings = await CompaniesSettings.findOne({ where: { companyId: company.id } });
    let whatsapp;
    try {
      whatsapp = await GetDefaultWhatsApp(null, company.id);
    } catch (err) {
      logger.warn({ companyId: company.id, error: err }, "Nenhum WhatsApp encontrado para lead");
    }

    const channelConfig = await GetChannelEntryConfigService(company.id, source);
    const defaultQueueId = channelConfig.defaultQueueId ?? undefined;
    const defaultTagId = channelConfig.defaultTagId ?? undefined;

    if (existingContact) {
      // Merge conservador: só preencher campos vazios
      const updates: any = {};
      if (shouldReplaceName(existingContact.name, canonical) && leadData.name?.trim()) {
        updates.name = leadData.name.trim();
      }
      if (!(existingContact.email || "").trim() && leadData.email?.trim()) {
        updates.email = leadData.email.trim();
      }
      if (!(existingContact.bzEmpresa || "").trim() && leadData.company?.trim()) {
        updates.bzEmpresa = leadData.company.trim();
      }
      if (Object.keys(updates).length > 0) {
        await existingContact.update(updates);
      }

      // ExtraInfo: dados do formulário
      const extraInfoLabel = source === "revendedor" ? "Mensagem do Revendedor" : "Mensagem do Lead";
      await ContactCustomField.create({
        contactId: existingContact.id,
        name: extraInfoLabel,
        value: leadData.message || ""
      });
      await ContactCustomField.create({
        contactId: existingContact.id,
        name: "Nome no formulário",
        value: leadData.name || ""
      });
      await ContactCustomField.create({
        contactId: existingContact.id,
        name: "Email no formulário",
        value: leadData.email || ""
      });
      await ContactCustomField.create({
        contactId: existingContact.id,
        name: "Data/Hora",
        value: format(new Date(), "dd/MM/yyyy HH:mm")
      });

      const [tag] = await Tag.findOrCreate({
        where: { name: tagNameBySource, companyId: company.id },
        defaults: { color: "#25D366", kanban: 0, companyId: company.id }
      });
      await ContactTag.findOrCreate({
        where: { contactId: existingContact.id, tagId: tag.id }
      });

      // Buscar ticket aberto com mesmo entrySource
      let openTicket: Ticket | null = null;
      if (whatsapp) {
        openTicket = await Ticket.findOne({
          where: {
            contactId: existingContact.id,
            companyId: company.id,
            whatsappId: whatsapp.id,
            entrySource: source,
            status: { [Op.in]: OPEN_TICKET_STATUSES }
          },
          order: [["id", "DESC"]]
        });
      }

      if (openTicket) {
        const bodyInternal = `Lead entrou em contato novamente pelo formulário em ${format(new Date(), "dd/MM/yyyy HH:mm")}. Dados informados: Nome: ${leadData.name || ""}, Email: ${leadData.email || ""}, Telefone: ${leadData.phone || ""}, Mensagem: ${leadData.message || "-"}`;
        const remoteJid = `${existingContact.number}@s.whatsapp.net`;
        await CreateMessageService({
          messageData: {
            wid: `internal_${uuidv4()}`,
            ticketId: openTicket.id,
            contactId: existingContact.id,
            body: bodyInternal,
            fromMe: true,
            isPrivate: true,
            remoteJid,
            participant: "",
            dataJson: "{}"
          },
          companyId: company.id
        });
        logger.info({ contactId: existingContact.id, ticketId: openTicket.id, companyId: company.id }, "Lead atualizado em contato existente, mensagem interna inserida");
        return res.status(200).json({
          contact: existingContact,
          message: "Lead atualizado com sucesso",
          isNew: false,
          ticketId: openTicket.id
        });
      }

      // Não há ticket aberto: criar novo ticket com entrySource
      if (whatsapp) {
        const ticket = await FindOrCreateTicketService(
          existingContact,
          whatsapp,
          0,
          company.id,
          defaultQueueId ?? null,
          null,
          null,
          whatsapp.channel,
          false,
          false,
          settings || undefined,
          false,
          false,
          source
        );
        const firstMessageBody = leadData.message
          ? `[Formulário ${tagNameBySource}]\n${leadData.message}`
          : `Contato enviado pelo formulário ${tagNameBySource}.`;
        const remoteJid = `${existingContact.number}@s.whatsapp.net`;
        await CreateMessageService({
          messageData: {
            wid: `lead_${uuidv4()}`,
            ticketId: ticket.id,
            contactId: existingContact.id,
            body: firstMessageBody,
            fromMe: false,
            remoteJid,
            participant: "",
            dataJson: "{}"
          },
          companyId: company.id
        });
        if (defaultTagId) {
          const TicketTag = (await import("../models/TicketTag")).default;
          await TicketTag.findOrCreate({
            where: { ticketId: ticket.id, tagId: defaultTagId }
          });
        }
        setImmediate(async () => {
          try {
            await SendWelcomeMessageService({
              contact: existingContact,
              companyId: company.id,
              welcomeMessage: channelConfig.welcomeMessage ?? undefined
            });
          } catch (err) {
            logger.error({ error: err, contactId: existingContact.id }, "Erro ao enviar mensagem de boas-vindas");
          }
        });
        return res.status(200).json({
          contact: existingContact,
          message: "Lead atualizado com sucesso",
          isNew: false,
          ticketId: ticket.id
        });
      }

      return res.status(200).json({
        contact: existingContact,
        message: "Lead atualizado com sucesso",
        isNew: false
      });
    }

    // Contato novo
    const contactData: any = {
      name: leadData.name,
      email: leadData.email || "",
      number: canonical,
      canonicalNumber: canonical,
      companyId: company.id,
      active: true,
      bzEmpresa: leadData.company || null
    };
    const contact = await Contact.create(contactData);

    if (leadData.message && contact.id) {
      await ContactCustomField.create({
        contactId: contact.id,
        name: source === "revendedor" ? "Mensagem do Revendedor" : "Mensagem do Lead",
        value: leadData.message
      });
    }

    const [leadTag] = await Tag.findOrCreate({
      where: { name: tagNameBySource, companyId: company.id },
      defaults: { color: "#25D366", kanban: 0, companyId: company.id }
    });
    await ContactTag.findOrCreate({
      where: { contactId: contact.id, tagId: leadTag.id }
    });

    if (!whatsapp) {
      logger.info({ contactId: contact.id, companyId: company.id }, "Lead criado sem WhatsApp para ticket");
      return res.status(201).json({ contact, message: "Lead criado com sucesso", isNew: true });
    }

    const ticket = await FindOrCreateTicketService(
      contact,
      whatsapp,
      0,
      company.id,
      defaultQueueId ?? null,
      null,
      null,
      whatsapp.channel,
      false,
      false,
      settings || undefined,
      false,
      false,
      source
    );

    const firstMessageBody = leadData.message
      ? `[Formulário ${tagNameBySource}]\n${leadData.message}`
      : `Contato enviado pelo formulário ${tagNameBySource}.`;
    const remoteJid = `${contact.number}@s.whatsapp.net`;
    await CreateMessageService({
      messageData: {
        wid: `lead_${uuidv4()}`,
        ticketId: ticket.id,
        contactId: contact.id,
        body: firstMessageBody,
        fromMe: false,
        remoteJid,
        participant: "",
        dataJson: "{}"
      },
      companyId: company.id
    });

    if (defaultTagId) {
      const TicketTag = (await import("../models/TicketTag")).default;
      await TicketTag.findOrCreate({
        where: { ticketId: ticket.id, tagId: defaultTagId }
      });
    }

    setImmediate(async () => {
      try {
        await SendWelcomeMessageService({
          contact,
          companyId: company.id,
          welcomeMessage: channelConfig.welcomeMessage ?? undefined
        });
      } catch (err) {
        logger.error({ error: err, contactId: contact.id }, "Erro ao enviar mensagem de boas-vindas");
      }
    });

    logger.info({ contactId: contact.id, companyId: company.id }, "Lead criado com sucesso");
    return res.status(201).json({
      contact,
      message: "Lead criado com sucesso",
      isNew: true,
      ticketId: ticket.id
    });
  } catch (error: any) {
    logger.error({ error: error.message }, "Erro ao criar lead");
    throw new AppError("Erro ao processar lead. Tente novamente.");
  }
};
