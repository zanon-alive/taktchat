import { Transaction } from "sequelize";
import CompaniesSettings from "../../models/CompaniesSettings";

export const getCompanySettingsDefaults = (companyId: number) => ({
  companyId,
  hoursCloseTicketsAuto: "9999999999",
  chatBotType: "text",
  acceptCallWhatsapp: "enabled",
  userRandom: "enabled",
  sendGreetingMessageOneQueues: "enabled",
  sendSignMessage: "enabled",
  sendFarewellWaitingTicket: "disabled",
  userRating: "disabled",
  sendGreetingAccepted: "enabled",
  CheckMsgIsGroup: "enabled",
  sendQueuePosition: "disabled",
  scheduleType: "disabled",
  acceptAudioMessageContact: "enabled",
  sendMsgTransfTicket: "disabled",
  enableLGPD: "disabled",
  requiredTag: "disabled",
  lgpdDeleteMessage: "disabled",
  lgpdHideNumber: "disabled",
  lgpdConsent: "disabled",
  lgpdLink: "",
  lgpdMessage: "",
  closeTicketOnTransfer: false,
  DirectTicketsToWallets: false,
  showNotificationPending: false,
  enableLandingSignup: false,
  hiddenTicketRetentionDays: 0
});

type Params = {
  companyId: number;
  transaction?: Transaction;
};

const EnsureCompanySettingsService = async ({
  companyId,
  transaction
}: Params): Promise<{ settings: CompaniesSettings; created: boolean }> => {
  const [settings, created] = await CompaniesSettings.findOrCreate({
    where: { companyId },
    defaults: getCompanySettingsDefaults(companyId),
    transaction
  });

  return { settings, created };
};

export const resolveCompanySettings = async (
  companyId: number,
  existing?: CompaniesSettings | null
): Promise<CompaniesSettings> => {
  if (existing) {
    return existing;
  }

  const { settings } = await EnsureCompanySettingsService({ companyId });
  return settings;
};

export default EnsureCompanySettingsService;
