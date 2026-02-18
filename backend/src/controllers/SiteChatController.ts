import { Request, Response } from "express";
import * as Yup from "yup";
import { Op } from "sequelize";
import Contact from "../models/Contact";
import Company from "../models/Company";
import Plan from "../models/Plan";
import Ticket from "../models/Ticket";
import Message from "../models/Message";
import logger from "../utils/logger";
import AppError from "../errors/AppError";
import GetDefaultWhatsApp from "../helpers/GetDefaultWhatsApp";
import GetSiteChatConnection from "../helpers/GetSiteChatConnection";
import GetChannelEntryConfigService from "../services/ChannelEntryConfigService/GetChannelEntryConfigService";
import FindOrCreateTicketService from "../services/TicketServices/FindOrCreateTicketService";
import CreateMessageService from "../services/MessageServices/CreateMessageService";
import { safeNormalizePhoneNumber } from "../utils/phone";
import { v4 as uuidv4 } from "uuid";
import CompaniesSettings from "../models/CompaniesSettings";
import ContactCustomField from "../models/ContactCustomField";

interface SiteChatSubmitData {
  name: string;
  email: string;
  phone?: string;
  message?: string;
  companyId?: number;
  companyToken?: string;
  interestPlanId?: number;
}

interface SiteChatMessageData {
  ticketId: string;
  token?: string;
  body: string;
}

const OPEN_TICKET_STATUSES = ["open", "pending", "bot", "lgpd"];

async function validateCompanyAndPlan(companyId: number): Promise<Company> {
  const company = await Company.findByPk(companyId, {
    include: [
      {
        model: Plan,
        as: "plan",
        attributes: ["id", "name", "useSiteChat"]
      }
    ]
  });

  if (!company) {
    throw new AppError("Empresa não encontrada.", 404);
  }

  if (company.type === "platform") {
    return company;
  }

  if (!company.plan) {
    throw new AppError("Plano não encontrado para esta empresa.", 400);
  }

  if (!company.plan.useSiteChat) {
    throw new AppError("Chat do site não disponível no seu plano.", 403);
  }

  return company;
}

function canUseSiteChat(company: Company & { plan?: Plan }): boolean {
  if (company.type === "platform") return true;
  return !!(company.plan && company.plan.useSiteChat);
}

export const submit = async (req: Request, res: Response): Promise<Response> => {
  const schema = Yup.object().shape({
    name: Yup.string().required("Nome é obrigatório"),
    email: Yup.string().email("Email inválido").required("Email é obrigatório"),
    phone: Yup.string().nullable(),
    message: Yup.string().max(500, "Mensagem muito longa").nullable(),
    companyId: Yup.number().nullable(),
    companyToken: Yup.string().nullable(),
    interestPlanId: Yup.number().nullable()
  });

  let data: SiteChatSubmitData;
  try {
    data = await schema.validate(req.body);
  } catch (err: any) {
    throw new AppError(err.message, 400);
  }

  let companyId = data.companyId;
  
  if (!companyId && data.companyToken) {
    const token = (data.companyToken || "").trim();
    const company = await Company.findOne({
      where: {
        [Op.or]: [{ signupToken: token }, { siteChatToken: token }]
      },
      attributes: ["id"]
    });
    if (!company) {
      throw new AppError("Token de empresa inválido.", 400);
    }
    companyId = company.id;
  }

  if (!companyId) {
    throw new AppError("companyId ou companyToken é obrigatório.", 400);
  }

  const company = await validateCompanyAndPlan(companyId);

  let interestPlan: Plan | null = null;
  if (data.interestPlanId != null) {
    interestPlan = await Plan.findByPk(data.interestPlanId, {
      attributes: ["id", "name"]
    });
    if (!interestPlan) {
      throw new AppError("Plano de interesse não encontrado.", 400);
    }
  }

  const phone = data.phone?.replace(/\D/g, "") || "";
  let canonical: string | null = null;
  let contact: Contact | null = null;

  if (phone) {
    const normalized = safeNormalizePhoneNumber(phone);
    canonical = normalized.canonical;
    if (canonical) {
      contact = await Contact.findOne({
        where: {
          companyId: company.id,
          [Op.or]: [
            { canonicalNumber: canonical },
            { number: canonical }
          ]
        }
      });
    }
  }

  if (!contact) {
    contact = await Contact.create({
      companyId: company.id,
      name: data.name.trim(),
      email: data.email.trim(),
      number: canonical || "",
      canonicalNumber: canonical || null
    });
  } else {
    await contact.update({
      name: contact.name || data.name.trim(),
      email: contact.email || data.email.trim()
    });
  }

  if (interestPlan) {
    await ContactCustomField.create({
      contactId: contact.id,
      name: "Plano de interesse",
      value: `${interestPlan.id} - ${interestPlan.name}`
    });
  }

  const settings = await CompaniesSettings.findOne({ where: { companyId: company.id } });
  let whatsapp;
  try {
    whatsapp = await GetDefaultWhatsApp(null, company.id);
  } catch (e: any) {
    if (e.message && String(e.message).includes("ERR_NO_DEF_WAPP_FOUND")) {
      whatsapp = await GetSiteChatConnection(company.id);
    } else {
      throw e;
    }
  }
  const channelConfig = await GetChannelEntryConfigService(company.id, "site_chat");
  const defaultQueueId = channelConfig.defaultQueueId ?? undefined;
  const defaultTagId = channelConfig.defaultTagId ?? undefined;

  let ticket: Ticket | null = null;
  if (whatsapp && canonical) {
    ticket = await Ticket.findOne({
      where: {
        contactId: contact.id,
        companyId: company.id,
        whatsappId: whatsapp.id,
        entrySource: "site_chat",
        status: { [Op.in]: OPEN_TICKET_STATUSES }
      },
      order: [["id", "DESC"]]
    });
  }

  if (!ticket && whatsapp) {
    ticket = await FindOrCreateTicketService(
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
      "site_chat"
    );

    if (defaultTagId) {
      const TicketTag = (await import("../models/TicketTag")).default;
      await TicketTag.findOrCreate({
        where: { ticketId: ticket.id, tagId: defaultTagId }
      });
    }
  }

  if (!ticket) {
    throw new AppError("Não foi possível criar ticket.", 500);
  }

  if (data.message) {
    const remoteJid = `${contact.number || contact.canonicalNumber || ""}@s.whatsapp.net`;
    await CreateMessageService({
      messageData: {
        wid: `site_chat_${uuidv4()}`,
        ticketId: ticket.id,
        contactId: contact.id,
        body: data.message,
        fromMe: false,
        remoteJid,
        participant: "",
        dataJson: "{}"
      },
      companyId: company.id
    });
  }

  if (interestPlan) {
    const bodyInternal = `Lead informou interesse no plano: ${interestPlan.name} (ID ${interestPlan.id}).`;
    const remoteJid = `${contact.number || contact.canonicalNumber || ""}@s.whatsapp.net`;
    await CreateMessageService({
      messageData: {
        wid: `internal_${uuidv4()}`,
        ticketId: ticket.id,
        contactId: contact.id,
        body: bodyInternal,
        fromMe: true,
        isPrivate: true,
        remoteJid,
        participant: "",
        dataJson: "{}"
      },
      companyId: company.id
    });
  }

  logger.info({ companyId: company.id, contactId: contact.id, ticketId: ticket.id }, "Site chat submit realizado");

  return res.status(200).json({
    ticketId: ticket.id,
    contactId: contact.id,
    token: ticket.uuid
  });
};

export const sendMessage = async (req: Request, res: Response): Promise<Response> => {
  const schema = Yup.object().shape({
    ticketId: Yup.string().nullable(),
    token: Yup.string().nullable(),
    body: Yup.string().required("Mensagem é obrigatória").max(1000, "Mensagem muito longa")
  });

  let data: SiteChatMessageData;
  try {
    data = await schema.validate(req.body);
  } catch (err: any) {
    throw new AppError(err.message, 400);
  }

  if (!data.ticketId && !data.token) {
    throw new AppError("ticketId ou token é obrigatório.", 400);
  }

  const where: any = {};
  if (data.ticketId) {
    where.id = data.ticketId;
  } else if (data.token) {
    where.uuid = data.token;
  }

  const ticket = await Ticket.findOne({
    where,
    include: [
      {
        model: Company,
        as: "company",
        include: [
          {
            model: Plan,
            as: "plan",
            attributes: ["id", "name", "useSiteChat"]
          }
        ]
      },
      {
        model: Contact,
        as: "contact"
      }
    ]
  });

  if (!ticket) {
    throw new AppError("Ticket não encontrado.", 404);
  }

  if (ticket.entrySource !== "site_chat") {
    throw new AppError("Ticket inválido para chat do site.", 400);
  }

  if (!ticket.company || !canUseSiteChat(ticket.company)) {
    throw new AppError("Chat do site não disponível no seu plano.", 403);
  }

  const remoteJid = `${ticket.contact?.number || ticket.contact?.canonicalNumber || ""}@s.whatsapp.net`;
  const message = await CreateMessageService({
    messageData: {
      wid: `site_chat_${uuidv4()}`,
      ticketId: ticket.id,
      contactId: ticket.contactId,
      body: data.body,
      fromMe: false,
      remoteJid,
      participant: "",
      dataJson: "{}"
    },
    companyId: ticket.companyId
  });

  return res.status(200).json(message);
};

export const getMessages = async (req: Request, res: Response): Promise<Response> => {
  const { ticketId, token } = req.query;

  if (!ticketId && !token) {
    throw new AppError("ticketId ou token é obrigatório.", 400);
  }

  const where: any = {};
  if (ticketId) {
    where.id = ticketId;
  } else if (token) {
    where.uuid = token;
  }

  const ticket = await Ticket.findOne({
    where,
    include: [
      {
        model: Company,
        as: "company",
        include: [
          {
            model: Plan,
            as: "plan",
            attributes: ["id", "name", "useSiteChat"]
          }
        ]
      }
    ]
  });

  if (!ticket) {
    throw new AppError("Ticket não encontrado.", 404);
  }

  if (ticket.entrySource !== "site_chat") {
    throw new AppError("Ticket inválido para chat do site.", 400);
  }

  if (!ticket.company || !canUseSiteChat(ticket.company)) {
    throw new AppError("Chat do site não disponível no seu plano.", 403);
  }

  const messages = await Message.findAll({
    where: {
      ticketId: ticket.id,
      companyId: ticket.companyId
    },
    order: [["createdAt", "ASC"]],
    attributes: ["id", "body", "fromMe", "createdAt", "mediaUrl", "mediaType"]
  });

  return res.status(200).json(messages);
};
