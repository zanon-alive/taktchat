import Plan from "../../models/Plan";
import Company from "../../models/Company";
import { getPlatformCompanyId } from "../../config/platform";

interface ListOptions {
  requestUserCompanyId?: number;
  requestUserSuper?: boolean;
}

const FindAllPlanService = async (
  listPublic?: string,
  options: ListOptions = {}
): Promise<Plan[]> => {
  const platformCompanyId = getPlatformCompanyId();
  const { requestUserCompanyId, requestUserSuper = false } = options;

  if (listPublic === "false") {
    return Plan.findAll({
      where: {
        isPublic: true,
        companyId: platformCompanyId,
        targetType: "direct"
      },
      order: [["name", "ASC"]]
    });
  }

  let where: any = {};
  if (!requestUserSuper && requestUserCompanyId != null) {
    const requestCompany = await Company.findByPk(requestUserCompanyId);
    if (requestCompany?.type === "whitelabel") {
      // Whitelabel vê apenas os próprios planos (não os planos da plataforma targetType whitelabel)
      where = { companyId: requestUserCompanyId };
    } else {
      where = { companyId: platformCompanyId, targetType: "direct" };
    }
  }

  return Plan.findAll({
    where: Object.keys(where).length > 0 ? where : undefined,
    order: [["name", "ASC"]]
  });
};

export default FindAllPlanService;
