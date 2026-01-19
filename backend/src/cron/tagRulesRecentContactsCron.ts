import cron from 'node-cron';
import { Op } from 'sequelize';
import Contact from '../models/Contact';
import Company from '../models/Company';
import ApplyTagRulesService from '../services/TagServices/ApplyTagRulesService';

// Executa a cada 5 minutos para processar contatos criados/atualizados recentemente
const tagRulesRecentContactsCron = () => {
  cron.schedule('*/5 * * * *', async () => {
    try {
      // Busca todas as companies ativas
      const companies = await Company.findAll({
        where: { status: true },
        attributes: ['id', 'name']
      });

      // Define janela de tempo: últimos 10 minutos
      const timeWindow = new Date(Date.now() - 10 * 60 * 1000);

      let totalCompaniesProcessed = 0;
      let totalContactsProcessed = 0;

      for (const company of companies) {
        try {
          // Busca contatos criados ou atualizados nos últimos 10 minutos
          const recentContacts = await Contact.findAll({
            where: {
              companyId: company.id,
              [Op.or]: [
                { createdAt: { [Op.gte]: timeWindow } },
                { updatedAt: { [Op.gte]: timeWindow } }
              ]
            },
            attributes: ['id', 'name', 'createdAt', 'updatedAt']
          });

          if (recentContacts.length === 0) {
            continue;
          }

          // Aplica regras para cada contato recente
          let companyContactsProcessed = 0;
          for (const contact of recentContacts) {
            try {
              await ApplyTagRulesService({
                companyId: company.id,
                contactId: contact.id
              });
              companyContactsProcessed++;
              totalContactsProcessed++;
            } catch (err) {
              console.error(`[TagRules Recent] Erro ao processar contato ${contact.id} (company ${company.id}):`, err);
            }
          }

          if (companyContactsProcessed > 0) {
            totalCompaniesProcessed++;
          }
        } catch (err) {
          console.error(`[TagRules Recent] Erro ao processar company ${company.id}:`, err);
        }
      }

      // Log apenas se houver processamento
      if (totalContactsProcessed > 0) {
        console.log(`[TagRules Recent] Processados ${totalContactsProcessed} contatos em ${totalCompaniesProcessed} companies`);
      }
    } catch (err) {
      console.error('[TagRules Recent] Erro geral:', err);
    }
  });
};

export default tagRulesRecentContactsCron;
