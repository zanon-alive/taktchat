import AppError from "../../errors/AppError";
import License from "../../models/License";
import Plan from "../../models/Plan";
import {
  getAllowedLicenseCompanyIds,
  canAccessLicenseCompany
} from "./getLicenseCompanyFilter";
import { logAudit } from "../AuditService";
import User from "../../models/User";
import Company from "../../models/Company";

interface Request {
  licenseId: number | string;
  requestUserCompanyId?: number;
  requestUserSuper?: boolean;
  requestUserId?: number;
}

/** Meses por unidade de pagamento conforme recorrência do plano */
function monthsPerRecurrence(recurrence: string | null): number {
  if (recurrence === "ANUAL") return 12;
  return 1; // MENSAL ou default
}

const RegisterPaymentService = async ({
  licenseId,
  requestUserCompanyId,
  requestUserSuper = false,
  requestUserId
}: Request): Promise<License> => {
  const license = await License.findByPk(licenseId);
  if (!license) {
    throw new AppError("Licença não encontrada.", 404);
  }

  const allowedIds = await getAllowedLicenseCompanyIds(
    requestUserCompanyId,
    requestUserSuper
  );
  if (!canAccessLicenseCompany(license.companyId, allowedIds)) {
    throw new AppError("Você não possui permissão para registrar pagamento nesta licença.", 403);
  }

  const plan = await Plan.findByPk(license.planId);
  const recurrence = license.recurrence ?? plan?.recurrence ?? "MENSAL";
  const monthsToAdd = monthsPerRecurrence(recurrence);

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  if (!license.activatedAt) {
    license.activatedAt = today;
  }
  license.paidMonths = (license.paidMonths || 0) + monthsToAdd;

  const currentEnd = license.endDate ? new Date(license.endDate) : today;
  currentEnd.setUTCHours(0, 0, 0, 0);
  const base = currentEnd.getTime() >= today.getTime() ? currentEnd : today;
  const endDate = new Date(base);
  endDate.setUTCMonth(endDate.getUTCMonth() + monthsToAdd);
  license.endDate = endDate;
  license.status = "active";
  await license.save();

  const company = await Company.findByPk(license.companyId);
  if (company) {
    await company.update({ dueDate: endDate.toISOString().slice(0, 10) });
  }

  // Auditoria
  const user = requestUserId ? await User.findByPk(requestUserId) : null;
  await logAudit({
    userId: requestUserId || null,
    userName: user?.name || "Sistema",
    companyId: requestUserCompanyId || license.companyId,
    action: "REGISTER_PAYMENT",
    entity: "License",
    entityId: license.id,
    details: {
      licenseId: license.id,
      companyId: license.companyId,
      planId: license.planId,
      recurrence,
      monthsAdded: monthsToAdd,
      paidMonths: license.paidMonths,
      newEndDate: license.endDate
    }
  });

  return license;
};

export default RegisterPaymentService;
