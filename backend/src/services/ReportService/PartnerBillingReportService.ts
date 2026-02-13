import Company from "../../models/Company";
import License from "../../models/License";
import Plan from "../../models/Plan";
import { getPlatformCompanyId } from "../../config/platform";
import { Op } from "sequelize";

export interface PartnerBillingItem {
  partnerId: number;
  partnerName: string;
  childCompaniesCount: number;
  activeLicensesCount: number;
  totalAmountDue: number;
  licenses: Array<{
    licenseId: number;
    companyId: number;
    companyName: string;
    planId: number;
    planName: string;
    amount: string | null;
    recurrence: string | null;
    status: string;
    endDate: Date | null;
    daysUntilExpiry: number | null;
  }>;
}

export interface PartnerBillingReport {
  period: {
    start: Date;
    end: Date | null;
  };
  partners: PartnerBillingItem[];
  totals: {
    totalPartners: number;
    totalChildCompanies: number;
    totalActiveLicenses: number;
    totalAmountDue: number;
  };
}

interface Request {
  requestUserCompanyId: number;
  requestUserSuper: boolean;
  partnerId?: number;
}

/**
 * Relatório de cobrança por parceiro (whitelabel).
 * Mostra quantidade de empresas-filhas ativas, licenças e valores devidos.
 */
const PartnerBillingReportService = async ({
  requestUserCompanyId,
  requestUserSuper,
  partnerId
}: Request): Promise<PartnerBillingReport> => {
  const platformCompanyId = getPlatformCompanyId();

  if (!requestUserSuper || requestUserCompanyId !== platformCompanyId) {
    throw new Error("Apenas o dono da plataforma pode acessar este relatório.");
  }

  const whereClause: any = { type: "whitelabel" };
  if (partnerId) {
    whereClause.id = partnerId;
  }

  const partners = await Company.findAll({
    where: whereClause,
    attributes: ["id", "name"],
    order: [["name", "ASC"]]
  });

  const partnerIds = partners.map((p) => p.id);

  const childCompanies = await Company.findAll({
    where: {
      parentCompanyId: { [Op.in]: partnerIds },
      type: "direct"
    },
    attributes: ["id", "name", "parentCompanyId"]
  });

  const childCompanyIds = childCompanies.map((c) => c.id);

  const licenses = await License.findAll({
    where: {
      companyId: { [Op.in]: childCompanyIds },
      status: { [Op.in]: ["active", "overdue"] }
    },
    include: [
      { model: Company, as: "company", attributes: ["id", "name", "parentCompanyId"] },
      { model: Plan, as: "plan", attributes: ["id", "name", "amount", "amountAnnual", "recurrence"] }
    ],
    order: [["endDate", "ASC"]]
  });

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const partnerBillingItems: PartnerBillingItem[] = partners.map((partner) => {
    const partnerChildCompanies = childCompanies.filter(
      (c) => c.parentCompanyId === partner.id
    );
    const partnerChildCompanyIds = partnerChildCompanies.map((c) => c.id);
    const partnerLicenses = licenses.filter(
      (l) => partnerChildCompanyIds.includes(l.companyId)
    );

    let totalAmountDue = 0;
    const licenseDetails = partnerLicenses.map((license) => {
      const plan = (license as any).plan as Plan;
      const company = (license as any).company as Company;
      const amountStr = license.recurrence === "ANUAL" && plan?.amountAnnual
        ? plan.amountAnnual
        : plan?.amount || license.amount || "0";
      const amount = parseFloat(amountStr) || 0;
      totalAmountDue += amount;

      let daysUntilExpiry: number | null = null;
      if (license.endDate) {
        const endDateOnly = new Date(license.endDate);
        endDateOnly.setUTCHours(0, 0, 0, 0);
        const diffMs = endDateOnly.getTime() - today.getTime();
        daysUntilExpiry = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      }

      return {
        licenseId: license.id,
        companyId: license.companyId,
        companyName: company?.name || String(license.companyId),
        planId: license.planId,
        planName: plan?.name || String(license.planId),
        amount: amountStr,
        recurrence: license.recurrence || plan?.recurrence || null,
        status: license.status,
        endDate: license.endDate,
        daysUntilExpiry
      };
    });

    return {
      partnerId: partner.id,
      partnerName: partner.name,
      childCompaniesCount: partnerChildCompanies.length,
      activeLicensesCount: partnerLicenses.length,
      totalAmountDue,
      licenses: licenseDetails
    };
  });

  const totals = {
    totalPartners: partners.length,
    totalChildCompanies: childCompanies.length,
    totalActiveLicenses: licenses.length,
    totalAmountDue: partnerBillingItems.reduce((sum, p) => sum + p.totalAmountDue, 0)
  };

  return {
    period: {
      start: today,
      end: null
    },
    partners: partnerBillingItems,
    totals
  };
};

export default PartnerBillingReportService;
