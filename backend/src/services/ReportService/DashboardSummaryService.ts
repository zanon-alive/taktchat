import Company from "../../models/Company";
import License from "../../models/License";
import Plan from "../../models/Plan";
import { getPlatformCompanyId } from "../../config/platform";

export type DashboardSummaryPlatform = {
  level: "platform";
  totalCompanies: number;
  totalWhitelabels: number;
  totalDirect: number;
  whitelabels: Array<{
    id: number;
    name: string;
    childCompaniesCount: number;
    activeLicensesCount: number;
  }>;
};

export type DashboardSummaryWhitelabel = {
  level: "whitelabel";
  companyId: number;
  companyName: string;
  childCompanies: Array<{
    id: number;
    name: string;
    type: string;
    planId: number | null;
  }>;
  licenses: Array<{
    id: number;
    companyId: number;
    companyName: string;
    planId: number;
    planName: string;
    status: string;
    startDate: string;
    endDate: string | null;
  }>;
};

export type DashboardSummaryDirect = {
  level: "direct";
  companyId: number;
  companyName: string;
};

export type DashboardSummary =
  | DashboardSummaryPlatform
  | DashboardSummaryWhitelabel
  | DashboardSummaryDirect;

interface Request {
  requestUserCompanyId: number;
  requestUserSuper: boolean;
}

export default async function DashboardSummaryService({
  requestUserCompanyId,
  requestUserSuper
}: Request): Promise<DashboardSummary> {
  const platformCompanyId = getPlatformCompanyId();

  if (requestUserSuper && requestUserCompanyId === platformCompanyId) {
    const companies = await Company.findAll({
      attributes: ["id", "name", "type", "parentCompanyId"],
      order: [["name", "ASC"]]
    });

    const whitelabels = companies.filter((c) => c.type === "whitelabel");
    const directCompanies = companies.filter((c) => c.type === "direct");
    const licenses = await License.findAll({
      where: { status: "active" },
      include: [
        { model: Company, as: "company", attributes: ["id", "name", "parentCompanyId"] },
        { model: Plan, as: "plan", attributes: ["id", "name"] }
      ]
    });

    const whitelabelSummaries = whitelabels.map((wl) => {
      const childCount = companies.filter(
        (c) => c.parentCompanyId === wl.id
      ).length;
      const activeLicensesCount = licenses.filter(
        (l) => (l as any).company?.parentCompanyId === wl.id
      ).length;

      return {
        id: wl.id,
        name: wl.name,
        childCompaniesCount: childCount,
        activeLicensesCount
      };
    });

    return {
      level: "platform",
      totalCompanies: companies.length,
      totalWhitelabels: whitelabels.length,
      totalDirect: directCompanies.length,
      whitelabels: whitelabelSummaries
    };
  }

  const requestCompany = await Company.findByPk(requestUserCompanyId);
  if (!requestCompany) {
    return {
      level: "direct",
      companyId: requestUserCompanyId,
      companyName: ""
    };
  }

  if (requestCompany.type === "whitelabel") {
    const childCompanies = await Company.findAll({
      where: { parentCompanyId: requestUserCompanyId },
      attributes: ["id", "name", "type", "planId"],
      order: [["name", "ASC"]]
    });

    const companyIds = childCompanies.map((c) => c.id);
    const licenses = await License.findAll({
      where: { companyId: companyIds, status: "active" },
      include: [
        { model: Company, as: "company", attributes: ["id", "name"] },
        { model: Plan, as: "plan", attributes: ["id", "name"] }
      ],
      order: [["createdAt", "DESC"]]
    });

    return {
      level: "whitelabel",
      companyId: requestCompany.id,
      companyName: requestCompany.name,
      childCompanies: childCompanies.map((c) => ({
        id: c.id,
        name: c.name,
        type: c.type || "direct",
        planId: c.planId
      })),
      licenses: licenses.map((l) => ({
        id: l.id,
        companyId: l.companyId,
        companyName: (l as any).company?.name ?? "",
        planId: l.planId,
        planName: (l as any).plan?.name ?? "",
        status: l.status,
        startDate: l.startDate?.toISOString?.() ?? String(l.startDate),
        endDate: l.endDate ? (l.endDate as Date).toISOString() : null
      }))
    };
  }

  return {
    level: "direct",
    companyId: requestCompany.id,
    companyName: requestCompany.name
  };
}
