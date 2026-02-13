import { Sequelize, Op, Filterable } from "sequelize";
import Plan from "../../models/Plan";
import Company from "../../models/Company";
import { getPlatformCompanyId } from "../../config/platform";

interface Request {
  searchParam?: string;
  pageNumber?: string;
  listPublic?: string;
  requestUserCompanyId?: number;
  requestUserSuper?: boolean;
}

interface Response {
  plans: Plan[];
  count: number;
  hasMore: boolean;
}

const ListPlansService = async ({
  searchParam = "",
  pageNumber = "1",
  listPublic,
  requestUserCompanyId,
  requestUserSuper = false
}: Request): Promise<Response> => {
  const platformCompanyId = getPlatformCompanyId();

  let whereCondition: Filterable["where"] = {
    [Op.or]: [
      {
        name: Sequelize.where(
          Sequelize.fn("LOWER", Sequelize.col("name")),
          "LIKE",
          `%${searchParam.toLowerCase().trim()}%`
        )
      }
    ]
  };

  if (listPublic === "false") {
    whereCondition = {
      ...whereCondition,
      isPublic: false
    };
  }

  let levelFilter: Filterable["where"] = {};
  if (!requestUserSuper && requestUserCompanyId != null) {
    const requestCompany = await Company.findByPk(requestUserCompanyId);
    if (requestCompany?.type === "whitelabel") {
      // Whitelabel vê apenas os próprios planos (não os planos da plataforma targetType whitelabel)
      levelFilter = { companyId: requestUserCompanyId };
    } else {
      levelFilter = { companyId: platformCompanyId, targetType: "direct" };
    }
  }

  const finalWhere =
    Object.keys(levelFilter).length > 0
      ? { [Op.and]: [whereCondition, levelFilter] }
      : whereCondition;

  const limit = 20;
  const offset = limit * (+pageNumber - 1);

  const { count, rows: plans } = await Plan.findAndCountAll({
    where: finalWhere,
    limit,
    offset,
    order: [["name", "ASC"]]
  });

  const hasMore = count > offset + plans.length;

  return {
    plans,
    count,
    hasMore
  };
};

export default ListPlansService;
