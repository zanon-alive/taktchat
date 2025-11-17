import { Op } from "sequelize";
import AppError from "../../errors/AppError";
import Company from "../../models/Company";
import Setting from "../../models/Setting";
import User from "../../models/User";

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
}

const UpdateCompanyService = async (
  companyData: CompanyData
): Promise<Company> => {
  console.log("[DEBUG UpdateCompanyService] Iniciando atualização");
  console.log("[DEBUG UpdateCompanyService] companyData recebido:", JSON.stringify(companyData, null, 2));
  console.log("[DEBUG UpdateCompanyService] companyData.id:", companyData.id);
  console.log("[DEBUG UpdateCompanyService] Tipo de companyData.id:", typeof companyData.id);

  const company = await Company.findByPk(companyData.id);
  console.log("[DEBUG UpdateCompanyService] Empresa encontrada:", company ? `Sim (ID: ${company.id})` : "Não");
  
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
    password
  } = companyData;

  console.log("[DEBUG UpdateCompanyService] Dados extraídos:");
  console.log("  - name:", name);
  console.log("  - email:", email);
  console.log("  - phone:", phone);
  console.log("  - status:", status);
  console.log("  - planId:", planId);
  console.log("  - document:", document);

  if (!company) {
    console.log("[DEBUG UpdateCompanyService] ERRO: Empresa não encontrada com ID:", companyData.id);
    throw new AppError("ERR_NO_COMPANY_FOUND", 404);
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

  // Busca o usuário da empresa atual para atualizar
  // Primeiro tenta encontrar pelo email fornecido, depois pelo email antigo da empresa,
  // e por último busca o primeiro usuário admin da empresa
  let user = null;
  
  if (email && email !== "") {
    // Tenta encontrar pelo email fornecido
    user = await User.findOne({
      where: {
        companyId: company.id,
        email: email
      }
    });
    console.log("[DEBUG UpdateCompanyService] Usuário encontrado pelo email fornecido:", user ? `Sim (ID: ${user.id})` : "Não");
  }
  
  if (!user && company.email && company.email !== "") {
    // Se não encontrou, tenta pelo email antigo da empresa
    user = await User.findOne({
      where: {
        companyId: company.id,
        email: company.email
      }
    });
    console.log("[DEBUG UpdateCompanyService] Usuário encontrado pelo email antigo da empresa:", user ? `Sim (ID: ${user.id})` : "Não");
  }
  
  if (!user) {
    // Se ainda não encontrou, busca o primeiro usuário admin da empresa
    user = await User.findOne({
      where: {
        companyId: company.id,
        profile: "admin"
      },
      order: [["id", "ASC"]]
    });
    console.log("[DEBUG UpdateCompanyService] Usuário admin encontrado:", user ? `Sim (ID: ${user.id})` : "Não");
  }

  if (!user) {
    console.log("[DEBUG UpdateCompanyService] ERRO: Nenhum usuário encontrado para a empresa ID:", company.id);
    throw new AppError("ERR_NO_USER_FOUND", 404)
  }
  
  console.log("[DEBUG UpdateCompanyService] Usuário que será atualizado - ID:", user.id, "Email atual:", user.email);
  
  // Atualiza o email e senha do usuário apenas se foram fornecidos
  const userUpdateData: { email?: string; password?: string } = {};
  if (email && email !== "" && email !== user.email) {
    userUpdateData.email = email;
    console.log("[DEBUG UpdateCompanyService] Email do usuário será atualizado para:", email);
  }
  if (password && password !== "") {
    userUpdateData.password = password;
    console.log("[DEBUG UpdateCompanyService] Senha do usuário será atualizada");
  }
  
  if (Object.keys(userUpdateData).length > 0) {
    console.log("[DEBUG UpdateCompanyService] Atualizando usuário com:", userUpdateData);
    await user.update(userUpdateData);
  } else {
    console.log("[DEBUG UpdateCompanyService] Nenhuma atualização necessária no usuário");
  }


  // Prepara os dados para atualização da empresa
  const companyUpdateData: any = {
    name,
    status,
    planId,
    dueDate,
    recurrence,
    document,
    paymentMethod
  };

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
