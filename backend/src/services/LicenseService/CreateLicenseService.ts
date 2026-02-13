import * as Yup from "yup";
import AppError from "../../errors/AppError";
import License from "../../models/License";
import Company from "../../models/Company";
import Plan from "../../models/Plan";

interface LicenseData {
  companyId: number;
  planId: number;
  status?: string;
  startDate: Date | string;
  endDate?: Date | string | null;
  amount?: string | null;
  recurrence?: string | null;
  requestUserCompanyId?: number;
  requestUserSuper?: boolean;
}

const CreateLicenseService = async (
  licenseData: LicenseData
): Promise<License> => {
  const {
    companyId,
    planId,
    status = "active",
    startDate,
    endDate,
    amount,
    recurrence,
    requestUserCompanyId,
    requestUserSuper = false
  } = licenseData;

  const schema = Yup.object().shape({
    companyId: Yup.number().required("Empresa é obrigatória."),
    planId: Yup.number().required("Plano é obrigatório."),
    startDate: Yup.date().required("Data de início é obrigatória.")
  });

  try {
    await schema.validate({ companyId, planId, startDate });
  } catch (err: any) {
    throw new AppError(err.message);
  }

  const company = await Company.findByPk(companyId);
  if (!company) {
    throw new AppError("Empresa não encontrada.");
  }

  const plan = await Plan.findByPk(planId);
  if (!plan) {
    throw new AppError("Plano não encontrado.");
  }

  if (!requestUserSuper && requestUserCompanyId != null) {
    const requestCompany = await Company.findByPk(requestUserCompanyId);
    if (requestCompany?.type === "whitelabel") {
      if (company.parentCompanyId !== requestUserCompanyId) {
        throw new AppError(
          "Whitelabel só pode criar licenças para suas próprias empresas-filhas."
        );
      }
    } else {
      if (companyId !== requestUserCompanyId) {
        throw new AppError("Cliente direto só pode criar licença para a própria empresa.");
      }
    }
  }

  const start = new Date(startDate);
  const license = await License.create({
    companyId,
    planId,
    status,
    startDate: start,
    endDate: endDate ? new Date(endDate) : null,
    amount: amount ?? plan.amount ?? null,
    recurrence: recurrence ?? plan.recurrence ?? null,
    activatedAt: start,
    paidMonths: 0
  });

  return license;
};

export default CreateLicenseService;
