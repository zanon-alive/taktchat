import { Op } from "sequelize";
import License from "../../models/License";
import Company from "../../models/Company";
import Plan from "../../models/Plan";
import { getLicenseCompanyFilter } from "./getLicenseCompanyFilter";

interface Request {
  searchParam?: string;
  pageNumber?: string;
  requestUserCompanyId?: number;
  requestUserSuper?: boolean;
  companyId?: number | string;
  status?: string;
  planId?: number | string;
}

interface Response {
  licenses: License[];
  count: number;
  hasMore: boolean;
}

const ListLicensesService = async ({
  searchParam = "",
  pageNumber = "1",
  requestUserCompanyId,
  requestUserSuper = false,
  companyId,
  status,
  planId
}: Request): Promise<Response> => {
  const limit = 20;
  const offset = limit * (+pageNumber - 1);

  const companyFilter = await getLicenseCompanyFilter(
    requestUserCompanyId,
    requestUserSuper
  );

  const where: any = {};
  if (companyFilter) {
    where.companyId = companyFilter.companyId;
  }
  
  // Filtros adicionais
  if (companyId) {
    where.companyId = companyId;
  }
  if (status) {
    where.status = status;
  }
  if (planId) {
    where.planId = planId;
  }

  const { count, rows: licenses } = await License.findAndCountAll({
    where,
    limit,
    offset,
    order: [["createdAt", "DESC"]],
    include: [
      { model: Company, as: "company", attributes: ["id", "name", "type"] },
      { model: Plan, as: "plan", attributes: ["id", "name", "amount"] }
    ]
  });

  const hasMore = count > offset + licenses.length;

  return {
    licenses,
    count,
    hasMore
  };
};

export default ListLicensesService;
