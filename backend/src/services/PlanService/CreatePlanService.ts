import * as Yup from "yup";
import AppError from "../../errors/AppError";
import Plan from "../../models/Plan";
import Company from "../../models/Company";
import { getPlatformCompanyId } from "../../config/platform";

interface PlanData {
  name: string;
  users?: number;
  connections?: number;
  queues?: number;
  amount?: string;
  amountAnnual?: string;
  useWhatsapp?: boolean;
  useFacebook?: boolean;
  useInstagram?: boolean;
  useCampaigns?: boolean;
  useSchedules?: boolean;
  useInternalChat?: boolean;
  useExternalApi?: boolean;
  useKanban?: boolean;
  trial?: boolean;
  trialDays?: number;
  recurrence?: string;
  useOpenAi?: boolean;
  useIntegrations?: boolean;
  useSiteChat?: boolean;
  isPublic?: boolean;
  companyId?: number | null;
  targetType?: "direct" | "whitelabel";
  requestUserCompanyId?: number;
  requestUserSuper?: boolean;
}

const CreatePlanService = async (planData: PlanData): Promise<Plan> => {
  const {
    name,
    companyId: requestedCompanyId,
    targetType: requestedTargetType,
    requestUserCompanyId,
    requestUserSuper = false
  } = planData;

  const platformCompanyId = getPlatformCompanyId();

  if (!requestUserSuper && requestUserCompanyId != null) {
    const requestCompany = await Company.findByPk(requestUserCompanyId);
    if (!requestCompany || requestCompany.type !== "whitelabel") {
      throw new AppError("Apenas o Dono da Plataforma ou um Whitelabel podem criar planos.");
    }
    planData.companyId = requestUserCompanyId;
    planData.targetType = "whitelabel";
  } else if (requestUserSuper) {
    planData.companyId = requestedCompanyId ?? platformCompanyId;
    planData.targetType = requestedTargetType ?? "direct";
  } else {
    throw new AppError("Apenas o Dono da Plataforma ou um Whitelabel podem criar planos.");
  }

  const planSchema = Yup.object().shape({
    name: Yup.string()
      .min(2, "ERR_PLAN_INVALID_NAME")
      .required("ERR_PLAN_INVALID_NAME")
      .test(
        "Check-unique-name",
        "ERR_PLAN_NAME_ALREADY_EXISTS",
        async value => {
          if (value) {
            const planWithSameName = await Plan.findOne({
              where: { name: value }
            });

            return !planWithSameName;
          }
          return false;
        }
      ),
    amountAnnual: Yup.string()
      .nullable()
      .test(
        "valid-number",
        "ERR_PLAN_INVALID_AMOUNT_ANNUAL",
        function (value) {
          if (!value || value.trim() === "") return true;
          const num = parseFloat(value);
          if (isNaN(num) || num < 0) return false;
          const amount = parseFloat(this.parent?.amount);
          if (!isNaN(amount) && amount > 0 && num < amount) return false;
          return true;
        }
      )
  });

  try {
    await planSchema.validate(planData);
  } catch (err) {
    throw new AppError(err.message);
  }

  const { requestUserCompanyId: _uc, requestUserSuper: _us, ...dataForCreate } = planData;
  const plan = await Plan.create(dataForCreate);

  return plan;
};

export default CreatePlanService;
