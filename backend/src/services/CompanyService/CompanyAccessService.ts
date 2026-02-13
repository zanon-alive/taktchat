import Company from "../../models/Company";
import License from "../../models/License";
import { getPlatformCompanyId } from "../../config/platform";

export interface CompanyAccessResult {
  allowed: boolean;
  reason?: string;
  code?: string;
}

/** Data de hoje em UTC (meia-noite) para comparação date-only */
function toDateOnly(d: Date): number {
  const x = new Date(d);
  x.setUTCHours(0, 0, 0, 0);
  x.setUTCMilliseconds(0);
  return x.getTime();
}

/**
 * Verifica se a empresa pode acessar o sistema (não bloqueada por licença nem pelo parceiro).
 * Empresa plataforma sempre permitida. Whitelabel/direct dependem de licença ativa e acesso não bloqueado pelo pai.
 */
const CompanyAccessService = async (companyId: number): Promise<CompanyAccessResult> => {
  if (companyId === getPlatformCompanyId()) {
    return { allowed: true };
  }

  const company = await Company.findByPk(companyId, {
    attributes: ["id", "type", "parentCompanyId", "accessBlockedByParent"]
  });

  if (!company) {
    return { allowed: false, reason: "Empresa não encontrada.", code: "ERR_COMPANY_NOT_FOUND" };
  }

  const today = toDateOnly(new Date());

  if (company.type === "whitelabel") {
    // Múltiplas licenças: considerar a vigente com maior endDate
    const licenses = await License.findAll({
      where: { companyId, status: "active" },
      order: [["endDate", "DESC"]]
    });
    const vigente = licenses.find(
      (l) => l.endDate != null && toDateOnly(l.endDate) >= today
    );
    if (!vigente) {
      return {
        allowed: false,
        reason: "Acesso bloqueado pela plataforma.",
        code: "ERR_ACCESS_BLOCKED_PLATFORM"
      };
    }
    return { allowed: true };
  }

  if (company.type === "direct") {
    if (company.accessBlockedByParent) {
      return {
        allowed: false,
        reason: "Acesso bloqueado pelo seu parceiro.",
        code: "ERR_ACCESS_BLOCKED_PARTNER"
      };
    }
    const parentId = company.parentCompanyId;
    if (parentId) {
      const parentAccess = await CompanyAccessService(parentId);
      if (!parentAccess.allowed) {
        return {
          allowed: false,
          reason: parentAccess.reason ?? "Acesso bloqueado pela plataforma.",
          code: parentAccess.code ?? "ERR_ACCESS_BLOCKED_PLATFORM"
        };
      }
    }
    // Múltiplas licenças: considerar a vigente com maior endDate
    const licenses = await License.findAll({
      where: { companyId, status: "active" },
      order: [["endDate", "DESC"]]
    });
    const vigente = licenses.find(
      (l) => l.endDate != null && toDateOnly(l.endDate) >= today
    );
    if (!vigente) {
      return {
        allowed: false,
        reason: "Licença vencida.",
        code: "ERR_LICENSE_OVERDUE"
      };
    }
    return { allowed: true };
  }

  return { allowed: true };
};

export default CompanyAccessService;
