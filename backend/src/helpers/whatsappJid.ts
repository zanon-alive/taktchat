import logger from "../utils/logger";

type ContactJidSource = {
  remoteJid?: string | null;
  number?: string | null;
};

export const getContactChatJid = (
  contact: ContactJidSource,
  isGroup = false
): string | undefined => {
  const remote = String(contact?.remoteJid || "").trim();
  const number = String(contact?.number || "").replace(/\D/g, "");
  const server = isGroup ? "g.us" : "s.whatsapp.net";

  // Presence: PN é estável. @lid faz jidDecode falhar em várias versões do Baileys.
  if (number) {
    return `${number}@${server}`;
  }

  if (remote.includes("@") && !remote.endsWith("@lid")) {
    return remote;
  }

  return undefined;
};

export const pickOutboundChatJid = (
  contact: ContactJidSource,
  isGroup = false,
  lastIncomingRemoteJid?: string | null
): string | undefined => {
  const incoming = String(lastIncomingRemoteJid || "").trim();
  if (incoming.endsWith("@g.us")) {
    return incoming;
  }
  // Resposta no mesmo JID da última mensagem recebida (sessão Signal do iOS).
  if (!isGroup && incoming.endsWith("@lid")) {
    return incoming;
  }
  return getContactChatJid(contact, isGroup);
};

export const resolveOutboundChatJid = async (
  ticket: { id?: number; isGroup?: boolean },
  contact: ContactJidSource
): Promise<string | undefined> => {
  let incoming: string | null = null;
  if (ticket?.id && !ticket.isGroup) {
    const { default: Message } = await import("../models/Message");
    const lastIncoming = await Message.findOne({
      where: { ticketId: ticket.id, fromMe: false },
      order: [["id", "DESC"]],
      attributes: ["remoteJid"]
    });
    incoming = lastIncoming?.remoteJid || null;
  }
  const jid = pickOutboundChatJid(contact, !!ticket?.isGroup, incoming);
  if (incoming?.endsWith("@lid") && jid === incoming) {
    logger.info(
      `[jid] Envio no @lid da última mensagem recebida ticket=${ticket.id}`
    );
  }
  return jid;
};

export const toWhatsAppAdapterAddress = (
  jid: string,
  channelType?: string
): string => {
  if (!jid) {
    return jid;
  }
  if (channelType === "official") {
    return jid.split("@")[0];
  }
  return jid;
};

export const safeSendPresenceUpdate = async (
  wbot: { sendPresenceUpdate?: Function; presenceSubscribe?: Function },
  presence: string,
  jid?: string
): Promise<void> => {
  if (!jid || !jid.includes("@") || typeof wbot?.sendPresenceUpdate !== "function") {
    return;
  }

  try {
    if (typeof wbot.presenceSubscribe === "function") {
      await wbot.presenceSubscribe(jid);
    }
    await wbot.sendPresenceUpdate(presence, jid);
  } catch (error: any) {
    const message = String(error?.message || error || "");
    if (message.includes("jidDecode") || message.includes("Cannot destructure")) {
      logger.warn(`[presence] JID inválido ignorado (${presence}): ${jid}`);
      return;
    }
    throw error;
  }
};
