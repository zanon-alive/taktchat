import { Op } from "sequelize";
import Company from "../../models/Company";

/** Lista de companyIds que o usuário pode acessar (licenças). undefined = todos. */
export type AllowedCompanyIds = number[] | undefined;

/**
 * Retorna os companyIds permitidos para licenças conforme o nível do usuário.
 * - super: undefined (todas as empresas)
 * - whitelabel: ids das empresas onde parentCompanyId = requestUserCompanyId
 * - direct: [requestUserCompanyId]
 */
export const getAllowedLicenseCompanyIds = async (
  requestUserCompanyId: number | undefined,
  requestUserSuper: boolean
): Promise<AllowedCompanyIds> => {
  if (requestUserSuper) return undefined;
  if (requestUserCompanyId == null) return undefined;
  const requestCompany = await Company.findByPk(requestUserCompanyId);
  if (requestCompany?.type === "whitelabel") {
    const children = await Company.findAll({
      where: { parentCompanyId: requestUserCompanyId },
      attributes: ["id"]
    });
    return children.map((c) => c.id);
  }
  return [requestUserCompanyId];
};

/**
 * Retorna o filtro where para Sequelize (companyId).
 */
export const getLicenseCompanyFilter = async (
  requestUserCompanyId: number | undefined,
  requestUserSuper: boolean
): Promise<{ companyId?: number | { [Op.in]: number[] } } | undefined> => {
  const ids = await getAllowedLicenseCompanyIds(
    requestUserCompanyId,
    requestUserSuper
  );
  if (ids === undefined) return undefined;
  if (ids.length === 0) return { companyId: -1 };
  return { companyId: { [Op.in]: ids } };
};

export const canAccessLicenseCompany = (
  licenseCompanyId: number,
  allowedIds: AllowedCompanyIds
): boolean => {
  if (allowedIds === undefined) return true;
  return allowedIds.includes(licenseCompanyId);
};
