import Company from "../../models/Company";
import License from "../../models/License";
import Plan from "../../models/Plan";
import PartnerBillingSnapshot from "../../models/PartnerBillingSnapshot";
import { getPlatformCompanyId } from "../../config/platform";
import { Op } from "sequelize";

interface Request {
  requestUserCompanyId: number;
  requestUserSuper: boolean;
  periodStart?: string; // YYYY-MM-DD (default: first day of current month)
  periodEnd?: string;   // YYYY-MM-DD (default: last day of current month)
}

function getDefaultPeriod(): { periodStart: Date; periodEnd: Date } {
  const now = new Date();
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  periodStart.setUTCHours(0, 0, 0, 0);
  periodEnd.setUTCHours(23, 59, 59, 999);
  return { periodStart, periodEnd };
}

/**
 * Calcula a cobrança por parceiro (planos ativos das empresas-filhas) e persiste em PartnerBillingSnapshot.
 * Apenas super da empresa plataforma.
 */
const CalculateAndStorePartnerBillingService = async ({
  requestUserCompanyId,
  requestUserSuper,
  periodStart: periodStartStr,
  periodEnd: periodEndStr,
}: Request): Promise<{ periodStart: Date; periodEnd: Date; created: number; snapshots: PartnerBillingSnapshot[] }> => {
  const platformCompanyId = getPlatformCompanyId();

  if (!requestUserSuper || requestUserCompanyId !== platformCompanyId) {
    throw new Error("Apenas o dono da plataforma pode registrar cobrança de parceiros.");
  }

  let periodStart: Date;
  let periodEnd: Date;

  if (periodStartStr && periodEndStr) {
    periodStart = new Date(periodStartStr);
    periodEnd = new Date(periodEndStr);
    periodStart.setUTCHours(0, 0, 0, 0);
    periodEnd.setUTCHours(23, 59, 59, 999);
  } else {
    const def = getDefaultPeriod();
    periodStart = def.periodStart;
    periodEnd = def.periodEnd;
  }

  const partners = await Company.findAll({
    where: { type: "whitelabel" },
    attributes: ["id", "name"],
    order: [["name", "ASC"]],
  });

  const partnerIds = partners.map((p) => p.id);

  const childCompanies = await Company.findAll({
    where: {
      parentCompanyId: { [Op.in]: partnerIds },
      type: "direct",
    },
    attributes: ["id", "name", "parentCompanyId"],
  });

  const childCompanyIds = childCompanies.map((c) => c.id);

  const licenses = await License.findAll({
    where: {
      companyId: { [Op.in]: childCompanyIds },
      status: { [Op.in]: ["active", "overdue"] },
    },
    include: [
      { model: Company, as: "company", attributes: ["id", "name", "parentCompanyId"] },
      { model: Plan, as: "plan", attributes: ["id", "name", "amount", "amountAnnual", "recurrence"] },
    ],
  });

  const periodStartDateOnly = periodStart.toISOString().slice(0, 10);
  const periodEndDateOnly = periodEnd.toISOString().slice(0, 10);

  const snapshots: PartnerBillingSnapshot[] = [];
  let created = 0;

  for (const partner of partners) {
    const partnerChildCompanies = childCompanies.filter((c) => c.parentCompanyId === partner.id);
    const partnerChildCompanyIds = partnerChildCompanies.map((c) => c.id);
    const partnerLicenses = licenses.filter((l) => partnerChildCompanyIds.includes(l.companyId));

    let totalAmountDue = 0;
    for (const license of partnerLicenses) {
      const plan = (license as any).plan as Plan;
      const amountStr =
        license.recurrence === "ANUAL" && plan?.amountAnnual
          ? plan.amountAnnual
          : plan?.amount || license.amount || "0";
      totalAmountDue += parseFloat(amountStr) || 0;
    }

    const [snapshot, wasCreated] = await PartnerBillingSnapshot.findOrCreate({
      where: {
        partnerId: partner.id,
        periodStart: periodStartDateOnly,
        periodEnd: periodEndDateOnly,
      },
      defaults: {
        partnerId: partner.id,
        periodStart: periodStartDateOnly,
        periodEnd: periodEndDateOnly,
        childCompaniesCount: partnerChildCompanies.length,
        activeLicensesCount: partnerLicenses.length,
        totalAmountDue: Math.round(totalAmountDue * 100) / 100,
      },
    });

    if (wasCreated) created++;
    else {
      await snapshot.update({
        childCompaniesCount: partnerChildCompanies.length,
        activeLicensesCount: partnerLicenses.length,
        totalAmountDue: Math.round(totalAmountDue * 100) / 100,
      });
    }
    snapshots.push(snapshot);
  }

  return {
    periodStart,
    periodEnd,
    created,
    snapshots,
  };
};

export default CalculateAndStorePartnerBillingService;
