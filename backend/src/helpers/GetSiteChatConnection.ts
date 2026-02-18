import Whatsapp from "../models/Whatsapp";

/**
 * Retorna a conexão de "Chat do Site" para a empresa.
 * Se não existir WhatsApp com channel site_chat, cria um registro virtual
 * (apenas para tickets do chat do site, sem envio real por WhatsApp).
 */
const GetSiteChatConnection = async (companyId: number): Promise<Whatsapp> => {
  let whatsapp = await Whatsapp.findOne({
    where: { companyId, channel: "site_chat" }
  });

  if (whatsapp) {
    return whatsapp;
  }

  whatsapp = await Whatsapp.create({
    name: "Chat do Site",
    session: "",
    qrcode: "",
    status: "CONNECTED",
    battery: "",
    plugged: false,
    retries: 0,
    number: "",
    greetingMessage: "",
    greetingMediaAttachment: "",
    farewellMessage: "",
    complationMessage: "",
    outOfHoursMessage: "",
    provider: "stable",
    isDefault: false,
    allowGroup: false,
    companyId,
    token: "",
    facebookUserId: "",
    facebookUserToken: "",
    facebookPageUserId: "",
    tokenMeta: "",
    channel: "site_chat",
    channelType: "baileys",
    wabaPhoneNumberId: "",
    wabaAccessToken: "",
    wabaBusinessAccountId: "",
    wabaWebhookVerifyToken: "",
    wabaConfig: {},
    maxUseBotQueues: 3,
    timeUseBotQueues: 0,
    expiresTicket: "0",
    timeSendQueue: 0,
    timeInactiveMessage: "",
    inactiveMessage: "",
    ratingMessage: "",
    maxUseBotQueuesNPS: 0,
    expiresTicketNPS: 0,
    whenExpiresTicket: "",
    expiresInactiveMessage: "disabled",
    groupAsTicket: "disabled",
    collectiveVacationMessage: "",
    collectiveVacationStart: "",
    collectiveVacationEnd: ""
  } as any);

  return whatsapp;
};

export default GetSiteChatConnection;
