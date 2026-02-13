import License from "../../models/License";
import Company from "../../models/Company";
import Plan from "../../models/Plan";
import AppError from "../../errors/AppError";
import {
  getAllowedLicenseCompanyIds,
  canAccessLicenseCompany
} from "./getLicenseCompanyFilter";

interface Request {
  id: string | number;
  requestUserCompanyId?: number;
  requestUserSuper?: boolean;
}

const ShowLicenseService = async ({
  id,
  requestUserCompanyId,
  requestUserSuper = false
}: Request): Promise<License> => {
  const license = await License.findByPk(id, {
    include: [
      { model: Company, as: "company", attributes: ["id", "name", "type"] },
      { model: Plan, as: "plan", attributes: ["id", "name", "amount"] }
    ]
  });

  if (!license) {
    throw new AppError("Licença não encontrada.", 404);
  }

  const allowedIds = await getAllowedLicenseCompanyIds(
    requestUserCompanyId,
    requestUserSuper
  );
  if (!canAccessLicenseCompany(license.companyId, allowedIds)) {
    throw new AppError("Você não possui permissão para acessar esta licença.", 403);
  }

  return license;
};

export default ShowLicenseService;
