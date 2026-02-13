import cron from 'node-cron';
import License from '../models/License';
import logger from '../utils/logger';

/**
 * Job que marca licenças como overdue quando a data de vencimento passou.
 * Executa diariamente à meia-noite.
 */
function toDateOnly(d: Date): number {
  const x = new Date(d);
  x.setUTCHours(0, 0, 0, 0);
  x.setUTCMilliseconds(0);
  return x.getTime();
}

const licenseOverdueCron = () => {
  cron.schedule('0 0 * * *', async () => {
    logger.info('[LicenseOverdue Cron] Iniciando marcação de licenças vencidas...');
    
    try {
      const today = toDateOnly(new Date());

      // Buscar licenças ativas com endDate passado
      const licenses = await License.findAll({
        where: {
          status: 'active'
        }
      });

      const overdueLicenses = licenses.filter((license) => {
        if (!license.endDate) return false;
        const endDateOnly = toDateOnly(license.endDate);
        return endDateOnly < today;
      });

      logger.info(`[LicenseOverdue Cron] Encontradas ${overdueLicenses.length} licenças vencidas`);

      let updatedCount = 0;
      for (const license of overdueLicenses) {
        try {
          await license.update({ status: 'overdue' });
          updatedCount++;
          logger.info(
            `[LicenseOverdue Cron] Licença ${license.id} (Empresa: ${license.companyId}) ` +
            `marcada como overdue. Vencimento: ${license.endDate}`
          );
        } catch (err) {
          logger.error(`[LicenseOverdue Cron] Erro ao atualizar licença ${license.id}:`, err);
        }
      }

      logger.info(`[LicenseOverdue Cron] ${updatedCount} licença(s) marcada(s) como overdue`);
      logger.info('[LicenseOverdue Cron] Processamento concluído!');
    } catch (err) {
      logger.error('[LicenseOverdue Cron] Erro geral:', err);
    }
  });

  logger.info('[LicenseOverdue Cron] Agendamento configurado: todos os dias à meia-noite');
};

export default licenseOverdueCron;
