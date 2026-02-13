import Company from "../../models/Company";
import Plan from "../../models/Plan";
import Setting from "../../models/Setting";

interface Request {
  /** ID da empresa do usuário que está listando (para filtro por nível) */
  requestUserCompanyId?: number;
  /** Se o usuário que está listando é super */
  requestUserSuper?: boolean;
}

const FindAllCompaniesService = async (
  options: Request = {}
): Promise<Company[]> => {
  const { requestUserCompanyId, requestUserSuper = false } = options;

  const where: any = {};
  if (!requestUserSuper && requestUserCompanyId != null) {
    const requestCompany = await Company.findByPk(requestUserCompanyId);
    if (requestCompany?.type === "whitelabel") {
      where.parentCompanyId = requestUserCompanyId;
    } else {
      where.id = requestUserCompanyId;
    }
  }

  const companies = await Company.findAll({
    where,
    order: [["name", "ASC"]],
    include: [
      { model: Plan, as: "plan", attributes: ["id", "name", "amount"] },
      { model: Setting, as: "settings" }
    ]
  });
  return companies;
};

export default FindAllCompaniesService;
