import * as Yup from "yup";
import AppError from "../../errors/AppError";
import Company from "../../models/Company";
import User from "../../models/User";
import Plan from "../../models/Plan";
import CompaniesSettings from "../../models/CompaniesSettings";
import CreateCompanyService from "./CreateCompanyService";
import CreateLicenseService from "../LicenseService/CreateLicenseService";
import { getPlatformCompanyId } from "../../config/platform";
import { sendWelcomePartnerSignupMail } from "../MailServices/SendWelcomePartnerSignupMailService";

const DEFAULT_TRIAL_DAYS = 14;

interface DirectSignupRequest {
  companyName: string;
  adminName: string;
  email: string;
  password: string;
  planId: number;
  phone?: string;
}

/**
 * Cadastro público direto de empresa cliente (sem parceiro).
 * Cria Company (direct), User (admin) e License (trial X dias).
 * Apenas funciona se enableLandingSignup estiver habilitado na empresa plataforma.
 */
const DirectSignupService = async (
  data: DirectSignupRequest
): Promise<{ company: Company; message: string }> => {
  const schema = Yup.object().shape({
    companyName: Yup.string().min(2).required("Nome da empresa é obrigatório."),
    adminName: Yup.string().min(2).required("Nome do responsável é obrigatório."),
    email: Yup.string().email().required("E-mail é obrigatório."),
    password: Yup.string().min(5).required("Senha é obrigatória (mín. 5 caracteres)."),
    planId: Yup.number().required("Plano é obrigatório.")
  });

  try {
    await schema.validate(data);
  } catch (err: any) {
    throw new AppError(err.message, 400);
  }

  const { companyName, adminName, email, password, planId, phone } = data;
  const platformCompanyId = getPlatformCompanyId();

  // Verificar se cadastro direto está habilitado
  const platformSettings = await CompaniesSettings.findOne({
    where: { companyId: platformCompanyId }
  });

  if (!platformSettings || !platformSettings.enableLandingSignup) {
    throw new AppError("Cadastro direto não está disponível no momento.", 403);
  }

  // Verificar se plano existe e pertence à plataforma
  const plan = await Plan.findByPk(planId);
  if (!plan) {
    throw new AppError("Plano não encontrado.", 400);
  }
  if (plan.companyId !== platformCompanyId || plan.targetType !== "direct") {
    throw new AppError("Plano inválido para cadastro direto.", 400);
  }

  // Verificar se email já existe
  const existingUser = await User.findOne({
    where: { email }
  });
  if (existingUser) {
    throw new AppError("E-mail já cadastrado.", 400);
  }

  // Criar empresa direta (sem parentCompanyId)
  const company = await CreateCompanyService({
    name: companyName,
    phone: phone || "",
    email,
    password,
    companyUserName: adminName,
    status: true,
    planId,
    dueDate: "",
    recurrence: "",
    type: "direct",
    parentCompanyId: null,
    requestUserCompanyId: platformCompanyId,
    requestUserSuper: true
  });

  // Criar licença com trial
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const endDate = new Date(today);
  endDate.setUTCDate(endDate.getUTCDate() + DEFAULT_TRIAL_DAYS);

  await CreateLicenseService({
    companyId: company.id,
    planId,
    status: "active",
    startDate: today,
    endDate,
    requestUserCompanyId: platformCompanyId,
    requestUserSuper: true
  });

  // E-mail de boas-vindas (não bloqueia o cadastro se falhar)
  sendWelcomePartnerSignupMail({
    to: email,
    companyName: company.name,
    adminName,
    trialDays: DEFAULT_TRIAL_DAYS
  }).catch(() => {});

  return {
    company,
    message: `Cadastro realizado. Você tem ${DEFAULT_TRIAL_DAYS} dias de trial.`
  };
};

export default DirectSignupService;
