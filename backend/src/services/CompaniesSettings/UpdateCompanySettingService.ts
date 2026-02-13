/** 
 * @TercioSantos-0 |
 * serviço/atualizar 1 configuração da empresa |
 * @params:companyId/column(name)/data
 */
import CompaniesSettings from "../../models/CompaniesSettings";

/** Colunas que são boolean no modelo - normalizar valor vindo da API */
const BOOLEAN_COLUMNS = new Set([
  "DirectTicketsToWallets",
  "closeTicketOnTransfer",
  "showNotificationPending",
  "enableLandingSignup",
]);

type Params = {
  companyId: number,
  column: string,
  data: any // Permite qualquer tipo (string, boolean, number, null)
};

function normalizeValue(column: string, data: any): any {
  if (BOOLEAN_COLUMNS.has(column)) {
    if (data === true || data === "true" || data === 1 || data === "1") return true;
    if (data === false || data === "false" || data === 0 || data === "0") return false;
  }
  if (column === "licenseWarningDays") {
    if (data === null || data === undefined || data === "") return null;
    const n = Number(data);
    return Number.isNaN(n) ? null : n;
  }
  return data;
}

const UpdateCompanySettingsService = async ({companyId, column, data}: Params): Promise<any> => {
  const normalized = normalizeValue(column, data);
  const updateData: any = {};
  updateData[column] = normalized;

  await CompaniesSettings.update(updateData, {
    where: { companyId }
  });

  const updated = await CompaniesSettings.findOne({
    where: { companyId }
  });

  return updated;
};

export default UpdateCompanySettingsService;