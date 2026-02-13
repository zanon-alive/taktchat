import { Op } from "sequelize";
import AppError from "../../errors/AppError";
import Company from "../../models/Company";
import Setting from "../../models/Setting";
import User from "../../models/User";
import { isPlatformCompany } from "../../config/platform";
import { generateSignupToken } from "../../helpers/PartnerSignupToken";

interface CompanyData {
  name: string;
  id?: number | string;
  phone?: string;
  email?: string;
  status?: boolean;
  planId?: number;
  campaignsEnabled?: boolean;
  dueDate?: string;
  recurrence?: string;
  document?: string;
  paymentMethod?: string;
  password?: string;
  type?: "platform" | "direct" | "whitelabel";
  parentCompanyId?: number | null;
  trialDaysForChildCompanies?: number | null;
  requestUserCompanyId?: number;
  requestUserSuper?: boolean;
}

const UpdateCompanyService = async (
  companyData: CompanyData
): Promise<Company> => {
  const company = await Company.findByPk(companyData.id);

  const {
    name,
    phone,
    email,
    status,
    planId,
    campaignsEnabled,
    dueDate,
    recurrence,
    document,
    paymentMethod,
    password,
    type: requestedType,
    parentCompanyId: requestedParentId,
    trialDaysForChildCompanies,
    requestUserCompanyId,
    requestUserSuper
  } = companyData;

  if (!company) {
    throw new AppError("ERR_NO_COMPANY_FOUND", 404);
  }

  const isSuper = requestUserSuper === true;

  // Apenas super pode alterar type e parentCompanyId
  if (requestedType !== undefined || requestedParentId !== undefined) {
    if (!isSuper || !requestUserCompanyId || !isPlatformCompany(requestUserCompanyId)) {
      throw new AppError(
        "Apenas o Dono da Plataforma pode alterar o tipo ou a empresa pai."
      );
    }
  }

  let type = company.type;
  let parentCompanyId = company.parentCompanyId;

  if (isSuper && requestedType !== undefined) {
    if (requestedType === "platform") {
      throw new AppError("Não é permitido alterar empresa para tipo Plataforma.");
    }
    type = requestedType;
    // type aqui é "direct" | "whitelabel" (platform já foi rejeitado acima)
    if (type === "whitelabel") {
      parentCompanyId = null;
    }
  }

  if (isSuper && requestedParentId !== undefined) {
    if (type === "platform" || type === "whitelabel") {
      if (requestedParentId !== null) {
        throw new AppError("Empresas Plataforma e Whitelabel devem ter empresa pai nula.");
      }
      parentCompanyId = null;
    } else {
      parentCompanyId = requestedParentId;
      if (parentCompanyId != null) {
        const parent = await Company.findByPk(parentCompanyId);
        if (!parent) throw new AppError("Empresa pai não encontrada.");
        if (parent.type !== "whitelabel") throw new AppError("A empresa pai deve ser Whitelabel.");
        if (parent.id === company.id) throw new AppError("Empresa não pode ser pai de si mesma.");
        let current: Company | null = parent;
        while (current?.parentCompanyId) {
          current = await Company.findByPk(current.parentCompanyId);
          if (current?.id === company.id) {
            throw new AppError("Não é permitido criar vínculo circular (loop).");
          }
        }
      }
    }
  }

  // Verifica se existe outro usuário com o mesmo email em outra empresa
  // APENAS se o email estiver sendo alterado
  if (email && email !== company.email) {
    const existUser = await User.findOne({
      where: {
        email: email,
        companyId: { [Op.ne]: company.id }
      }
    });

    if (existUser) {
      throw new AppError("Usuário já existe com esse e-mail em outra empresa!", 400)
    }
  }

  let user = null;
  if (email && email !== "") {
    user = await User.findOne({
      where: { companyId: company.id, email: email }
    });
  }
  if (!user && company.email && company.email !== "") {
    user = await User.findOne({
      where: { companyId: company.id, email: company.email }
    });
  }
  if (!user) {
    user = await User.findOne({
      where: { companyId: company.id, profile: "admin" },
      order: [["id", "ASC"]]
    });
  }

  if (!user) {
    throw new AppError("ERR_NO_USER_FOUND", 404);
  }

  const userUpdateData: { email?: string; password?: string } = {};
  if (email && email !== "" && email !== user.email) {
    userUpdateData.email = email;
  }
  if (password && password !== "") {
    userUpdateData.password = password;
  }
  if (Object.keys(userUpdateData).length > 0) {
    await user.update(userUpdateData);
  }

  const companyUpdateData: any = {
    name,
    status,
    planId,
    dueDate,
    recurrence,
    document,
    paymentMethod,
    type,
    parentCompanyId
  };

  // Apenas whitelabel pode ter trialDaysForChildCompanies
  if (type === "whitelabel" && trialDaysForChildCompanies !== undefined) {
    // Apenas super ou o próprio whitelabel pode alterar
    if (isSuper || (requestUserCompanyId === company.id && company.type === "whitelabel")) {
      companyUpdateData.trialDaysForChildCompanies = trialDaysForChildCompanies;
    }
  }

  // Garantir signupToken para whitelabel (gera se ainda não tiver)
  if (type === "whitelabel" && !company.signupToken) {
    companyUpdateData.signupToken = generateSignupToken();
  }

  // Inclui campos opcionais apenas se foram fornecidos
  if (phone !== undefined) {
    companyUpdateData.phone = phone;
  }
  if (email !== undefined && email !== null) {
    companyUpdateData.email = email;
  } else {
    // Se email não foi fornecido, mantém o email atual
    companyUpdateData.email = company.email;
  }

  await company.update(companyUpdateData);

  if (companyData.campaignsEnabled !== undefined) {
    const [setting, created] = await Setting.findOrCreate({
      where: {
        companyId: company.id,
        key: "campaignsEnabled"
      },
      defaults: {
        companyId: company.id,
        key: "campaignsEnabled",
        value: `${campaignsEnabled}`
      }
    });
    if (!created) {
      await setting.update({ value: `${campaignsEnabled}` });
    }
  }

  return company;
};

export default UpdateCompanyService;
