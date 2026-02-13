import AppError from "../../errors/AppError";
import Company from "../../models/Company";
import { logAudit } from "../AuditService";
import User from "../../models/User";

interface Request {
  companyId: number | string;
  blocked: boolean;
  requestUserCompanyId: number;
  requestUserSuper: boolean;
  requestUserId?: number;
}

/**
 * Parceiro (whitelabel) bloqueia ou libera acesso de uma empresa-filha (direct).
 * Apenas permitido quando a empresa alvo tem parentCompanyId === requestUserCompanyId.
 */
const BlockCompanyAccessService = async ({
  companyId,
  blocked,
  requestUserCompanyId,
  requestUserSuper,
  requestUserId
}: Request): Promise<Company> => {
  const company = await Company.findByPk(companyId, {
    attributes: ["id", "type", "parentCompanyId", "accessBlockedByParent"]
  });

  if (!company) {
    throw new AppError("Empresa não encontrada.", 404);
  }

  if (company.type !== "direct" || company.parentCompanyId !== requestUserCompanyId) {
    throw new AppError("Você só pode bloquear ou liberar empresas que são suas filhas.", 403);
  }

  const requestCompany = await Company.findByPk(requestUserCompanyId, {
    attributes: ["type"]
  });
  if (!requestCompany || requestCompany.type !== "whitelabel") {
    throw new AppError("Apenas parceiros (whitelabel) podem bloquear acesso de empresas filhas.", 403);
  }

  await company.update({ accessBlockedByParent: !!blocked });
  
  // Auditoria
  const user = requestUserId ? await User.findByPk(requestUserId) : null;
  await logAudit({
    userId: requestUserId || null,
    userName: user?.name || "Sistema",
    companyId: requestUserCompanyId,
    action: blocked ? "BLOCK_COMPANY_ACCESS" : "UNBLOCK_COMPANY_ACCESS",
    entity: "Company",
    entityId: company.id,
    details: {
      targetCompanyId: company.id,
      targetCompanyName: company.name,
      blocked
    }
  });
  
  return company;
};

export default BlockCompanyAccessService;
