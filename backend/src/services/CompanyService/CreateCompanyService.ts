import * as Yup from "yup";
import AppError from "../../errors/AppError";
import Company from "../../models/Company";
import User from "../../models/User";
import sequelize from "../../database";
import CompaniesSettings from "../../models/CompaniesSettings";
import Queue from "../../models/Queue";
import UserQueue from "../../models/UserQueue";
import Plan from "../../models/Plan";
import { getPlatformCompanyId, isPlatformCompany } from "../../config/platform";
import CreateLicenseService from "../LicenseService/CreateLicenseService";
import { generateSignupToken } from "../../helpers/PartnerSignupToken";

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
    dueDate,
    recurrence,
    document,
    paymentMethod,
    companyUserName,
    type: requestedType,
    parentCompanyId: requestedParentId,
    requestUserCompanyId,
    requestUserSuper
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

  const t = await sequelize.transaction();

  try {
    const company = await Company.create({
      name,
      phone,
      email,
      status,
      planId,
      dueDate,
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

    const settings = await CompaniesSettings.create({
          companyId: company.id,
          hoursCloseTicketsAuto: "9999999999",
          chatBotType: "text",
          acceptCallWhatsapp: "enabled",
          userRandom: "enabled",
          sendGreetingMessageOneQueues: "enabled",
          sendSignMessage: "enabled",
          sendFarewellWaitingTicket: "disabled",
          userRating: "disabled",
          sendGreetingAccepted: "enabled",
          CheckMsgIsGroup: "enabled",
          sendQueuePosition: "disabled",
          scheduleType: "disabled",
          acceptAudioMessageContact: "enabled",
          sendMsgTransfTicket:"disabled",
          enableLGPD: "disabled",
          requiredTag: "disabled",
          lgpdDeleteMessage: "disabled",
          lgpdHideNumber: "disabled",
          lgpdConsent: "disabled",
          lgpdLink:"",
          lgpdMessage:"",
          createdAt: new Date(),
          updatedAt: new Date(),
          closeTicketOnTransfer: false,
          DirectTicketsToWallets: false
    },{ transaction: t });

    const plan = planId ? await Plan.findByPk(planId) : null;
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

    // Garantir licença para empresas whitelabel
    if (type === "whitelabel" && planId) {
      try {
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);
        // Criar licença inicial com 30 dias de validade (pode ser ajustado)
        const endDate = new Date(today);
        endDate.setUTCDate(endDate.getUTCDate() + 30);
        
        await CreateLicenseService({
          companyId: company.id,
          planId: planId,
          status: "active",
          startDate: today,
          endDate: endDate,
          requestUserCompanyId: requestUserCompanyId || platformCompanyId,
          requestUserSuper: requestUserSuper || false
        });
      } catch (licenseError: any) {
        // Log do erro mas não falha a criação da empresa
        console.warn(`[CreateCompanyService] Erro ao criar licença para whitelabel ${company.id}:`, licenseError?.message || licenseError);
      }
    }

    await t.commit();

    return company;
  } catch (error) {
    await t.rollback();
    throw new AppError("Não foi possível criar a empresa!", error);
  }
};

export default CreateCompanyService;