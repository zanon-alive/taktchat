import * as Yup from "yup";
import AppError from "../../errors/AppError";
import Company from "../../models/Company";
import User from "../../models/User";
import Plan from "../../models/Plan";
import CompanyAccessService from "./CompanyAccessService";
import CreateCompanyService from "./CreateCompanyService";
import CreateLicenseService from "../LicenseService/CreateLicenseService";
import { sendWelcomePartnerSignupMail } from "../MailServices/SendWelcomePartnerSignupMailService";

const DEFAULT_TRIAL_DAYS = 7;

interface PartnerSignupRequest {
  partnerId: number;
  companyName: string;
  adminName: string;
  email: string;
  password: string;
  planId: number;
  phone?: string;
}

/**
 * Cadastro público de empresa-filha por link do parceiro (whitelabel).
 * Cria Company (direct), User (admin) e License (trial X dias).
 */
const PartnerSignupService = async (
  data: PartnerSignupRequest
): Promise<{ company: Company; message: string }> => {
  const schema = Yup.object().shape({
    partnerId: Yup.number().required("Parceiro é obrigatório."),
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

  const { partnerId, companyName, adminName, email, password, planId, phone } = data;

  const partner = await Company.findByPk(partnerId, {
    attributes: ["id", "type", "name", "trialDaysForChildCompanies"]
  });
  if (!partner) {
    throw new AppError("Parceiro não encontrado.", 400);
  }
  if (partner.type !== "whitelabel") {
    throw new AppError("Parceiro inválido.", 400);
  }

  const access = await CompanyAccessService(partnerId);
  if (!access.allowed) {
    throw new AppError("Parceiro não está disponível para novos cadastros.", 400);
  }

  const trialDays = partner.trialDaysForChildCompanies ?? DEFAULT_TRIAL_DAYS;
  if (trialDays < 1) {
    throw new AppError("Parceiro não possui trial configurado.", 400);
  }

  const plan = await Plan.findByPk(planId);
  if (!plan) {
    throw new AppError("Plano não encontrado.", 400);
  }
  if (plan.companyId !== partnerId) {
    throw new AppError("Plano não pertence ao parceiro.", 400);
  }

  const existingUser = await User.findOne({
    where: { email }
  });
  if (existingUser) {
    throw new AppError("E-mail já cadastrado.", 400);
  }

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
    parentCompanyId: partnerId,
    requestUserCompanyId: partnerId,
    requestUserSuper: false
  });

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const endDate = new Date(today);
  endDate.setUTCDate(endDate.getUTCDate() + trialDays);

  await CreateLicenseService({
    companyId: company.id,
    planId,
    status: "active",
    startDate: today,
    endDate,
    requestUserCompanyId: partnerId,
    requestUserSuper: false
  });

  // E-mail de boas-vindas (não bloqueia o cadastro se falhar)
  sendWelcomePartnerSignupMail({
    to: email,
    companyName: company.name,
    adminName,
    trialDays
  }).catch(() => {});

  return {
    company,
    message: `Cadastro realizado. Você tem ${trialDays} dias de trial.`
  };
};

export default PartnerSignupService;
