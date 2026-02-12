import * as Yup from "yup";
import AppError from "../../errors/AppError";
import Plan from "../../models/Plan";

interface PlanData {
  name: string;
  id?: number | string;
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
  useOpenAi?: boolean;
  useIntegrations?: boolean;
  isPublic?: boolean;
  companyId?: number | null;
  targetType?: "direct" | "whitelabel";
}

const UpdatePlanService = async (planData: PlanData): Promise<Plan> => {
  const { id } = planData;

  const amountAnnualSchema = Yup.object().shape({
    amountAnnual: Yup.string()
      .nullable()
      .test(
        "valid-number",
        "ERR_PLAN_INVALID_AMOUNT_ANNUAL",
        function (value) {
          if (!value || (typeof value === "string" && value.trim() === ""))
            return true;
          const num = parseFloat(String(value));
          if (isNaN(num) || num < 0) return false;
          const amount = parseFloat(this.parent?.amount);
          if (!isNaN(amount) && amount > 0 && num < amount) return false;
          return true;
        }
      )
  });

  const plan = await Plan.findByPk(id);

  if (!plan) {
    throw new AppError("ERR_NO_PLAN_FOUND", 404);
  }

  try {
    await amountAnnualSchema.validate({
      amountAnnual: planData.amountAnnual,
      amount: planData.amount ?? plan.amount
    });
  } catch (err) {
    throw new AppError(err.message);
  }

  await plan.update(planData);
  return plan;
};

export default UpdatePlanService;
