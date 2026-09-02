import * as Yup from "yup";
import AppError from "../../errors/AppError";
import Company from "../../models/Company";
import User from "../../models/User";
import sequelize from "../../database";
import CompaniesSettings from "../../models/CompaniesSettings";
import { getCompanySettingsDefaults } from "../CompaniesSettings/EnsureCompanySettingsService";
import Queue from "../../models/Queue";
import UserQueue from "../../models/UserQueue";
import Plan from "../../models/Plan";
import { getPlatformCompanyId, isPlatformCompany } from "../../config/platform";
import CreateLicenseService from "../LicenseService/CreateLicenseService";
import { parseLicensePeriod } from "./parseLicensePeriod";
import { generateSignupToken } from "../../helpers/PartnerSignupToken";
import { mapCompanyCreateError, isIdUniqueConstraintError } from "../../helpers/mapCompanyCreateError";
import { syncCompanyCreateSequences } from "../../helpers/syncSerialSequence";
import logger from "../../utils/logger";

interface CompanyData {
  name: string;
  phone?: string;
  email?: string;
  status?: boolean;
  planId?: number;
  dueDate?: string;
  recurrence?: string;
  document?: string;
  paymentMethod?: string;
  password?: string;
  companyUserName?: string;
  type?: "platform" | "direct" | "whitelabel";
  parentCompanyId?: number | null;
  /** ID da empresa do usuário que está criando (para validações de permissão) */
  requestUserCompanyId?: number;
  /** Se o usuário que está criando é super */
  requestUserSuper?: boolean;
  licenseStartDate?: string;
  licenseEndDate?: string;
}

const CreateCompanyService = async (
  companyData: CompanyData
): Promise<Company> => {
  const {
    name,
    phone,
    password,
    email,
    status,
    planId,
    recurrence,
    document,
    paymentMethod,
    companyUserName,
    type: requestedType,
    parentCompanyId: requestedParentId,
    requestUserCompanyId,
    requestUserSuper,
    licenseStartDate,
    licenseEndDate
  } = companyData;

  const companySchema = Yup.object().shape({
    name: Yup.string()
      .min(2, "ERR_COMPANY_INVALID_NAME")
      .required("ERR_COMPANY_INVALID_NAME")
  });

  try {
    await companySchema.validate({ name });
  } catch (err: any) {
    throw new AppError(err.message);
  }

  const platformCompanyId = getPlatformCompanyId();
  const type = requestedType ?? "direct";
  let parentCompanyId: number | null = requestedParentId ?? null;

  // Apenas super da empresa plataforma pode criar empresa type = 'whitelabel'
  if (type === "whitelabel") {
    if (!requestUserSuper || requestUserCompanyId !== platformCompanyId) {
      throw new AppError(
        "Apenas o Dono da Plataforma pode criar empresas do tipo Whitelabel."
      );
    }
    parentCompanyId = null;
  }

  if (type === "platform") {
    throw new AppError(
      "Não é permitido criar empresa do tipo Plataforma (já existe uma)."
    );
  }

  // type = 'direct': pode ter parentCompanyId (cliente de whitelabel)
  if (type === "direct" && parentCompanyId != null) {
    const parent = await Company.findByPk(parentCompanyId);
    if (!parent) {
      throw new AppError("Empresa pai não encontrada.");
    }
    if (parent.type !== "whitelabel") {
      throw new AppError("A empresa pai deve ser do tipo Whitelabel.");
    }
    // Só o dono da plataforma ou o próprio whitelabel podem criar empresa-filha
    if (requestUserSuper && isPlatformCompany(requestUserCompanyId!)) {
      // super pode criar filha de qualquer whitelabel
    } else if (requestUserCompanyId === parentCompanyId) {
      // whitelabel criando sua própria filha
    } else {
      throw new AppError(
        "Apenas o Dono da Plataforma ou o próprio Whitelabel podem criar empresas vinculadas a um Whitelabel."
      );
    }
  }

  const existingName = await Company.findOne({ where: { name } });
  if (existingName) {
    throw new AppError("Já existe uma empresa com este nome.", 400);
  }

  if (email) {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw new AppError("E-mail já cadastrado.", 400);
    }
  }

  const licensePeriod = parseLicensePeriod(
    planId,
    licenseStartDate,
    licenseEndDate
  );

  const t = await sequelize.transaction();

  try {
    const company = await Company.create({
      name,
      phone,
      email,
      status,
      planId: licensePeriod.planId,
      dueDate: licensePeriod.dueDate,
      recurrence,
      document,
      paymentMethod,
      type,
      parentCompanyId,
      ...(type === "whitelabel" ? { signupToken: generateSignupToken() } : {})
    },
      { transaction: t }
    );

    const user = await User.create({
      name: companyUserName ? companyUserName : name,
      email: company.email,
      password: password ? password : "mudar123",
      profile: "admin",
      companyId: company.id
    },
      { transaction: t }
    );

    const settings = await CompaniesSettings.create(
      getCompanySettingsDefaults(company.id),
      { transaction: t }
    );

    const plan = await Plan.findByPk(licensePeriod.planId);
    const canCreateQueue = plan && Number(plan.queues) >= 1;
    if (canCreateQueue) {
      const queue = await Queue.create({
        name: "Padrão",
        color: "#6366f1",
        companyId: company.id,
        greetingMessage: "",
        orderQueue: 1,
        ativarRoteador: false,
        tempoRoteador: 0
      }, { transaction: t });
      await UserQueue.create({
        userId: user.id,
        queueId: queue.id
      }, { transaction: t });
    }

    await CreateLicenseService({
      companyId: company.id,
      planId: licensePeriod.planId,
      status: "active",
      startDate: licensePeriod.startDate,
      endDate: licensePeriod.endDate,
      requestUserCompanyId: requestUserCompanyId || platformCompanyId,
      requestUserSuper: requestUserSuper || false,
      transaction: t
    });

    await t.commit();

    return company;
  } catch (error) {
    await t.rollback();
    if (isIdUniqueConstraintError(error)) {
      try {
        await syncCompanyCreateSequences();
      } catch (syncError) {
        logger.error({ err: syncError }, "Falha ao alinhar sequences após unique de id");
      }
    }
    throw mapCompanyCreateError(error);
  }
};

export default CreateCompanyService;