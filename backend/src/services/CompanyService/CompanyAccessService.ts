import { Transaction } from "sequelize";
import Company from "../../models/Company";
import License from "../../models/License";
import { getPlatformCompanyId } from "../../config/platform";

export interface CompanyAccessResult {
  allowed: boolean;
  billingOnly?: boolean;
  reason?: string;
  code?: string;
}

export function canUseBillingOnly(
  access: CompanyAccessResult,
  profile?: string
): boolean {
  return Boolean(access.billingOnly && profile === "admin");
}

/** Data de hoje em UTC (meia-noite) para comparação date-only */
export function toDateOnly(d: Date): number {
  const x = new Date(d);
  x.setUTCHours(0, 0, 0, 0);
  x.setUTCMilliseconds(0);
  return x.getTime();
}

export async function findVigenteLicense(
  companyId: number,
  transaction?: Transaction
): Promise<License | null> {
  const today = toDateOnly(new Date());
  const licenses = await License.findAll({
    where: { companyId, status: "active" },
    order: [["endDate", "DESC"]],
    ...(transaction ? { transaction } : {})
  });
  return (
    licenses.find(
      l => l.endDate != null && toDateOnly(l.endDate) >= today
    ) ?? null
  );
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

  if (company.type === "whitelabel") {
    const vigente = await findVigenteLicense(companyId);
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
    const vigente = await findVigenteLicense(companyId);
    if (!vigente) {
      return {
        allowed: false,
        billingOnly: true,
        reason: "Licença vencida.",
        code: "ERR_LICENSE_OVERDUE"
      };
    }
    return { allowed: true };
  }

  return { allowed: true };
};

export default CompanyAccessService;
