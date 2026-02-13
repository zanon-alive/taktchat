import { Request, Response } from "express";
import DashboardDataService, { DashboardData, Params } from "../services/ReportService/DashbardDataService";
import DashboardSummaryService from "../services/ReportService/DashboardSummaryService";
import PartnerBillingReportService from "../services/ReportService/PartnerBillingReportService";
import CalculateAndStorePartnerBillingService from "../services/ReportService/CalculateAndStorePartnerBillingService";
import PartnerBillingSnapshot from "../models/PartnerBillingSnapshot";
import Company from "../models/Company";
import { TicketsAttendance } from "../services/ReportService/TicketsAttendance";
import { TicketsDayService } from "../services/ReportService/TicketsDayService";
import TicketsQueuesService from "../services/TicketServices/TicketsQueuesService";
import logger from "../utils/logger";

type IndexQuery = {
  initialDate: string;
  finalDate: string;
  companyId: number | any;
};

type IndexQueryPainel = {
  dateStart: string;
  dateEnd: string;
  status: string[];
  queuesIds: string[];
  showAll: string;
};
export const index = async (req: Request, res: Response): Promise<Response> => {
  const params: Params = req.query;
  const { companyId } = req.user;
  const dashboardData: DashboardData = await DashboardDataService(
    companyId,
    params
  );
  return res.status(200).json(dashboardData);
};

/** Resumo do dashboard por nível: plataforma (super), whitelabel ou direto */
export const summary = async (req: Request, res: Response): Promise<Response> => {
  const { companyId, super: isSuper } = req.user;
  const data = await DashboardSummaryService({
    requestUserCompanyId: companyId,
    requestUserSuper: !!isSuper
  });
  return res.status(200).json(data);
};

export const reportsUsers = async (req: Request, res: Response): Promise<Response> => {

  const { initialDate, finalDate, companyId } = req.query as IndexQuery

  const { data } = await TicketsAttendance({ initialDate, finalDate, companyId });

  return res.json({ data });

}

export const reportsDay = async (req: Request, res: Response): Promise<Response> => {

  const { initialDate, finalDate, companyId } = req.query as IndexQuery

  const { count, data } = await TicketsDayService({ initialDate, finalDate, companyId });

  return res.json({ count, data });

}

export const DashTicketsQueues = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { companyId, profile, id: userId } = req.user;
  const { dateStart, dateEnd, status, queuesIds, showAll } = req.query as IndexQueryPainel;

  const tickets = await TicketsQueuesService({
    showAll: profile === "admin" ? showAll : false,
    dateStart,
    dateEnd,
    status,
    queuesIds,
    userId,
    companyId,
    profile
  });

  return res.status(200).json(tickets);
};

/** Relatório de cobrança por parceiro (apenas super) */
export const partnerBillingReport = async (req: Request, res: Response): Promise<Response> => {
  const { companyId, super: isSuper } = req.user;
  const { partnerId } = req.query as { partnerId?: string };

  const report = await PartnerBillingReportService({
    requestUserCompanyId: companyId,
    requestUserSuper: !!isSuper,
    partnerId: partnerId ? parseInt(partnerId, 10) : undefined
  });

  return res.status(200).json(report);
};

/** Calcular e registrar cobrança dos parceiros para um período (apenas super) */
export const partnerBillingCalculate = async (req: Request, res: Response): Promise<Response> => {
  const { companyId, super: isSuper } = req.user;
  const { periodStart, periodEnd } = req.body as { periodStart?: string; periodEnd?: string };

  const result = await CalculateAndStorePartnerBillingService({
    requestUserCompanyId: companyId,
    requestUserSuper: !!isSuper,
    periodStart,
    periodEnd
  });

  return res.status(200).json({
    message: "Cobrança calculada e registrada.",
    periodStart: result.periodStart,
    periodEnd: result.periodEnd,
    created: result.created,
    totalPartners: result.snapshots.length,
    snapshots: result.snapshots.map((s) => ({
      id: s.id,
      partnerId: s.partnerId,
      periodStart: s.periodStart,
      periodEnd: s.periodEnd,
      childCompaniesCount: s.childCompaniesCount,
      activeLicensesCount: s.activeLicensesCount,
      totalAmountDue: s.totalAmountDue,
      createdAt: s.createdAt
    }))
  });
};

/** Listar cobranças registradas (snapshots) por parceiro/período (apenas super) */
export const partnerBillingSnapshots = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { companyId, super: isSuper } = req.user;
    const { getPlatformCompanyId } = await import("../config/platform");
    const platformCompanyId = getPlatformCompanyId();

    if (!isSuper || companyId !== platformCompanyId) {
      return res.status(403).json({ error: "Apenas o dono da plataforma pode acessar." });
    }

    const { partnerId, periodStart, limit } = req.query as { partnerId?: string; periodStart?: string; limit?: string };

    const where: any = {};
    if (partnerId) where.partnerId = parseInt(partnerId, 10);
    if (periodStart) where.periodStart = periodStart;

    const snapshots = await PartnerBillingSnapshot.findAll({
      where,
      order: [["createdAt", "DESC"]],
      limit: limit ? Math.min(parseInt(limit, 10) || 50, 100) : 50
    });

    // Incluir nome do parceiro (Company) quando existir associação
    const partnerIds = [...new Set((snapshots as any[]).map((s) => s.partnerId).filter(Boolean))];
    const partners =
      partnerIds.length > 0
        ? await Company.findAll({
            where: { id: partnerIds },
            attributes: ["id", "name"]
          })
        : [];
    const partnerMap = new Map(partners.map((p) => [p.id, p]));
    const result = (snapshots as any[]).map((s) => {
      const partner = partnerMap.get(s.partnerId);
      return {
        ...s.toJSON(),
        partner: partner ? { id: partner.id, name: partner.name } : null
      };
    });

    return res.status(200).json(result);
  } catch (err: any) {
    const code = err?.parent?.code || err?.original?.code;
    logger.error(
      { err, message: err?.message, code, stack: err?.stack },
      "[partnerBillingSnapshots] Erro ao listar snapshots"
    );
    if (code === "42P01") {
      return res.status(503).json({
        error: "Tabela PartnerBillingSnapshots não encontrada. Execute as migrations: npm run db:migrate (na pasta backend).",
        code: "DB_TABLE_NOT_FOUND"
      });
    }
    throw err;
  }
};