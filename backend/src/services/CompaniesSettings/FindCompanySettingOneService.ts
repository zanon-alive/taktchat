import sequelize from "../../database";

const ALLOWED_COLUMNS = new Set([
  "hoursCloseTicketsAuto",
  "chatBotType",
  "acceptCallWhatsapp",
  "userRandom",
  "sendGreetingMessageOneQueues",
  "sendSignMessage",
  "sendFarewellWaitingTicket",
  "userRating",
  "sendGreetingAccepted",
  "CheckMsgIsGroup",
  "sendQueuePosition",
  "scheduleType",
  "acceptAudioMessageContact",
  "sendMsgTransfTicket",
  "enableLGPD",
  "requiredTag",
  "lgpdDeleteMessage",
  "lgpdHideNumber",
  "lgpdConsent",
  "lgpdLink",
  "lgpdMessage",
  "DirectTicketsToWallets",
  "closeTicketOnTransfer",
  "transferMessage",
  "greetingAcceptedMessage",
  "AcceptCallWhatsappMessage",
  "sendQueuePositionMessage",
  "showNotificationPending",
  "openaiApiKey",
  "openaiModel",
  "licenseWarningDays",
  "enableLandingSignup",
  "hiddenTicketRetentionDays",
  "ragEnabled",
  "ragTopK",
  "ragEmbeddingModel"
]);

type Params = {
  companyId: number;
  column: string;
};

const FindCompanySettingOneService = async ({
  companyId,
  column
}: Params): Promise<Record<string, unknown>[]> => {
  if (!ALLOWED_COLUMNS.has(column)) {
    return [];
  }

  const companyIdNum = Number(companyId);
  if (!Number.isInteger(companyIdNum) || companyIdNum < 1) {
    return [];
  }

  const [results] = await sequelize.query(
    `SELECT "${column}" FROM "CompaniesSettings" WHERE "companyId" = :companyId`,
    { replacements: { companyId: companyIdNum } }
  );

  return (results as Record<string, unknown>[]) || [];
};

export default FindCompanySettingOneService;
