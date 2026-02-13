import License from "../../models/License";
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

const DeleteLicenseService = async ({
  id,
  requestUserCompanyId,
  requestUserSuper = false
}: Request): Promise<void> => {
  const license = await License.findByPk(id);
  if (!license) {
    throw new AppError("Licença não encontrada.", 404);
  }

  const allowedIds = await getAllowedLicenseCompanyIds(
    requestUserCompanyId,
    requestUserSuper
  );
  if (!canAccessLicenseCompany(license.companyId, allowedIds)) {
    throw new AppError("Você não possui permissão para excluir esta licença.", 403);
  }

  await license.destroy();
};

export default DeleteLicenseService;
