import License from "../../models/License";
import Company from "../../models/Company";
import Plan from "../../models/Plan";
import { getLicenseCompanyFilter } from "./getLicenseCompanyFilter";

interface Request {
  requestUserCompanyId?: number;
  requestUserSuper?: boolean;
}

const FindAllLicensesService = async (
  options: Request = {}
): Promise<License[]> => {
  const { requestUserCompanyId, requestUserSuper = false } = options;

  const companyFilter = await getLicenseCompanyFilter(
    requestUserCompanyId,
    requestUserSuper
  );

  const where: any = {};
  if (companyFilter) {
    where.companyId = companyFilter.companyId;
  }

  return License.findAll({
    where,
    order: [["createdAt", "DESC"]],
    include: [
      { model: Company, as: "company", attributes: ["id", "name", "type"] },
      { model: Plan, as: "plan", attributes: ["id", "name", "amount"] }
    ]
  });
};

export default FindAllLicensesService;
