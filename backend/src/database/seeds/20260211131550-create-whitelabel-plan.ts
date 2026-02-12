import { QueryInterface } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    return queryInterface.sequelize.transaction(async t => {
      // Verificar se já existe plano whitelabel
      const planExists = await queryInterface.rawSelect("Plans", {
        where: {
          name: "Plano Whitelabel Básico"
        }
      }, ["id"]);

      if (!planExists) {
        // Obter ID da empresa plataforma (default: 1)
        const platformCompanyId = process.env.PLATFORM_COMPANY_ID 
          ? parseInt(process.env.PLATFORM_COMPANY_ID, 10) 
          : 1;

        await queryInterface.bulkInsert("Plans", [{
          name: "Plano Whitelabel Básico",
          users: 50,
          connections: 20,
          queues: 20,
          amount: "500.00",
          amountAnnual: "5000.00",
          useWhatsapp: true,
          useFacebook: true,
          useInstagram: true,
          useCampaigns: true,
          useSchedules: true,
          useInternalChat: true,
          useExternalApi: true,
          useKanban: true,
          useOpenAi: true,
          useIntegrations: true,
          trial: false,
          trialDays: 0,
          recurrence: "MENSAL",
          isPublic: false,
          companyId: platformCompanyId,
          targetType: "whitelabel",
          createdAt: new Date(),
          updatedAt: new Date()
        }], { transaction: t });
      }
    });
  },

  down: async (queryInterface: QueryInterface) => {
    return queryInterface.bulkDelete("Plans", {
      name: "Plano Whitelabel Básico"
    });
  }
};
