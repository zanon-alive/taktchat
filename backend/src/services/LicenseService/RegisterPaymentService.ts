import AppError from "../../errors/AppError";
import License from "../../models/License";
import Plan from "../../models/Plan";
import {
  getAllowedLicenseCompanyIds,
  canAccessLicenseCompany
} from "./getLicenseCompanyFilter";
import { logAudit } from "../AuditService";
import User from "../../models/User";

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

  const activatedAt = license.activatedAt
    ? new Date(license.activatedAt)
    : new Date();
  if (!license.activatedAt) {
    license.activatedAt = activatedAt;
  }
  license.paidMonths = (license.paidMonths || 0) + monthsToAdd;

  const endDate = new Date(activatedAt);
  endDate.setUTCMonth(endDate.getUTCMonth() + license.paidMonths);
  license.endDate = endDate;
  license.status = "active";
  await license.save();

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
