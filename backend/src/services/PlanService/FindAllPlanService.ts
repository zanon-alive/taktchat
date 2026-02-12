import Plan from "../../models/Plan";
import { getPlatformCompanyId } from "../../config/platform";

const FindAllPlanService = async (listPublic?: any): Promise<Plan[]> => {
  let plan;
  
  if (listPublic === "false") {
    // Para landing page: apenas planos públicos da empresa plataforma para clientes diretos
    const platformCompanyId = getPlatformCompanyId();
    
    plan = await Plan.findAll({
      where: {
        isPublic: true,
        companyId: platformCompanyId,
        targetType: "direct"
      },
      order: [["name", "ASC"]]
    });
  } else {
    // Para listagem interna: todos os planos
    plan = await Plan.findAll({
      order: [["name", "ASC"]]
    });
  }
  
  return plan;
};

export default FindAllPlanService;
