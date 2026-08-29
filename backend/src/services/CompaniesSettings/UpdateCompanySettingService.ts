import CompaniesSettings from "../../models/CompaniesSettings";
import EnsureCompanySettingsService from "./EnsureCompanySettingsService";

const BOOLEAN_COLUMNS = new Set([
  "DirectTicketsToWallets",
  "closeTicketOnTransfer",
  "showNotificationPending",
  "enableLandingSignup"
]);

type Params = {
  companyId: number;
  column: string;
  data: any;
};

function normalizeValue(column: string, data: any): any {
  if (BOOLEAN_COLUMNS.has(column)) {
    if (data === true || data === "true" || data === 1 || data === "1") return true;
    if (data === false || data === "false" || data === 0 || data === "0") return false;
  }
  if (column === "licenseWarningDays" || column === "hiddenTicketRetentionDays") {
    if (data === null || data === undefined || data === "") {
      return column === "hiddenTicketRetentionDays" ? 0 : null;
    }
    const n = Number(data);
    if (Number.isNaN(n) || n < 0) {
      return column === "hiddenTicketRetentionDays" ? 0 : null;
    }
    return Math.floor(n);
  }
  return data;
}

const UpdateCompanySettingsService = async ({
  companyId,
  column,
  data
}: Params): Promise<CompaniesSettings | null> => {
  await EnsureCompanySettingsService({ companyId });

  const normalized = normalizeValue(column, data);
  const updateData: Record<string, unknown> = {};
  updateData[column] = normalized;

  await CompaniesSettings.update(updateData, {
    where: { companyId }
  });

  return CompaniesSettings.findOne({
    where: { companyId }
  });
};

export default UpdateCompanySettingsService;
