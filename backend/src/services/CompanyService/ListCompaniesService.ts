import { Op } from "sequelize";
import Company from "../../models/Company";
import Plan from "../../models/Plan";

interface Request {
  searchParam?: string;
  pageNumber?: string;
  /** ID da empresa do usuário que está listando (para filtro por nível) */
  requestUserCompanyId?: number;
  /** Se o usuário que está listando é super */
  requestUserSuper?: boolean;
}

interface Response {
  companies: Company[];
  count: number;
  hasMore: boolean;
}

const ListCompaniesService = async ({
  searchParam = "",
  pageNumber = "1",
  requestUserCompanyId,
  requestUserSuper = false
}: Request): Promise<Response> => {
  const limit = 20;
  const offset = limit * (+pageNumber - 1);

  const where: any = {};
  if (searchParam) {
    where.name = { [Op.like]: `%${searchParam}%` };
  }

  if (!requestUserSuper && requestUserCompanyId != null) {
    const requestCompany = await Company.findByPk(requestUserCompanyId);
    if (requestCompany?.type === "whitelabel") {
      where.parentCompanyId = requestUserCompanyId;
    } else {
      where.id = requestUserCompanyId;
    }
  }

  const { count, rows: companies } = await Company.findAndCountAll({
    where,
    include: [{
      model: Plan,
      as: "plan",
      attributes: ["name"]
    }],
    limit,
    offset,
    order: [["name", "ASC"]]
  });

  const hasMore = count > offset + companies.length;

  return {
    companies,
    count,
    hasMore
  };
};

export default ListCompaniesService;
