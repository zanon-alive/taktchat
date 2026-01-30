import * as Yup from "yup";
import AppError from "../../errors/AppError";
import Company from "../../models/Company";
import User from "../../models/User";
import sequelize from "../../database";
import CompaniesSettings from "../../models/CompaniesSettings";
import Queue from "../../models/Queue";
import UserQueue from "../../models/UserQueue";
import Plan from "../../models/Plan";

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
    companyUserName
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
      paymentMethod
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

    await t.commit();

    return company;
  } catch (error) {
    await t.rollback();
    throw new AppError("Não foi possível criar a empresa!", error);
  }
};

export default CreateCompanyService;