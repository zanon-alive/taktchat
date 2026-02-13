import * as Yup from "yup";
import AppError from "../../errors/AppError";
import License from "../../models/License";
import {
  getAllowedLicenseCompanyIds,
  canAccessLicenseCompany
} from "./getLicenseCompanyFilter";
import { logAudit } from "../AuditService";
import User from "../../models/User";

interface LicenseData {
  id: number | string;
  companyId?: number;
  planId?: number;
  status?: string;
  startDate?: Date | string;
  endDate?: Date | string | null;
  amount?: string | null;
  recurrence?: string | null;
  activatedAt?: Date | string | null;
  paidMonths?: number;
  requestUserCompanyId?: number;
  requestUserSuper?: boolean;
  requestUserId?: number;
}

const UpdateLicenseService = async (
  licenseData: LicenseData
): Promise<License> => {
  const {
    id,
    status,
    startDate,
    endDate,
    amount,
    recurrence,
    activatedAt,
    paidMonths,
    requestUserCompanyId,
    requestUserSuper = false,
    requestUserId
  } = licenseData;

  const license = await License.findByPk(id);
  if (!license) {
    throw new AppError("Licença não encontrada.", 404);
  }

  const allowedIds = await getAllowedLicenseCompanyIds(
    requestUserCompanyId,
    requestUserSuper
  );
  if (!canAccessLicenseCompany(license.companyId, allowedIds)) {
    throw new AppError("Você não possui permissão para alterar esta licença.", 403);
  }

  const oldStatus = license.status;
  if (status !== undefined) license.status = status;
  if (startDate !== undefined) license.startDate = new Date(startDate);
  if (endDate !== undefined) license.endDate = endDate ? new Date(endDate) : null;
  if (amount !== undefined) license.amount = amount;
  if (recurrence !== undefined) license.recurrence = recurrence;
  if (activatedAt !== undefined) license.activatedAt = activatedAt ? new Date(activatedAt) : null;
  if (paidMonths !== undefined) license.paidMonths = paidMonths;

  await license.save();

  // Auditoria: quando status muda para suspended ou active
  if (status !== undefined && status !== oldStatus && (status === "suspended" || status === "active")) {
    const user = requestUserId ? await User.findByPk(requestUserId) : null;
    await logAudit({
      userId: requestUserId || null,
      userName: user?.name || "Sistema",
      companyId: requestUserCompanyId || license.companyId,
      action: status === "suspended" ? "SUSPEND_LICENSE" : "ACTIVATE_LICENSE",
      entity: "License",
      entityId: license.id,
      details: {
        licenseId: license.id,
        companyId: license.companyId,
        oldStatus,
        newStatus: status
      }
    });
  }

  return license;
};

export default UpdateLicenseService;
