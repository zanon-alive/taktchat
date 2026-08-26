import CompaniesSettings from "../../models/CompaniesSettings";
import EnsureCompanySettingsService from "./EnsureCompanySettingsService";

interface Request {
  companyId: number;
}

const FindCompanySettingsService = async ({
  companyId
}: Request): Promise<CompaniesSettings> => {
  const { settings } = await EnsureCompanySettingsService({ companyId });
  return settings;
};

export default FindCompanySettingsService;
