import cron from 'node-cron';
import License from '../models/License';
import Company from '../models/Company';
import CompaniesSettings from '../models/CompaniesSettings';
import logger from '../utils/logger';
import { sendBillingWarningMail } from '../services/MailServices/SendBillingWarningMailService';
import { getIO } from '../libs/socket';

/**
 * Job que verifica licenças próximas do vencimento e registra avisos.
 * Executa diariamente às 9h da manhã.
 * 
 * Parâmetro configurável: dias antes do vencimento para avisar
 * - Prioridade: CompaniesSettings.licenseWarningDays (por empresa)
 * - Fallback: LICENSE_WARNING_DAYS (env var, padrão: 7 dias)
 */
const DEFAULT_LICENSE_WARNING_DAYS = parseInt(process.env.LICENSE_WARNING_DAYS || '7', 10);

function toDateOnly(d: Date): number {
  const x = new Date(d);
  x.setUTCHours(0, 0, 0, 0);
  x.setUTCMilliseconds(0);
  return x.getTime();
}

const licenseBillingWarningCron = () => {
  cron.schedule('0 9 * * *', async () => {
    logger.info('[LicenseBillingWarning Cron] Iniciando verificação de licenças próximas do vencimento...');
    
    try {
      const today = toDateOnly(new Date());

      // Buscar licenças ativas que vencem em X dias
      const licenses = await License.findAll({
        where: {
          status: 'active'
        },
        include: [
          {
            model: Company,
            as: 'company',
            attributes: ['id', 'name', 'email']
          }
        ],
        order: [['endDate', 'ASC']]
      });

      // Buscar configurações de dias de aviso por empresa
      const companyIds = [...new Set(licenses.map(l => l.companyId))];
      const settings = await CompaniesSettings.findAll({
        where: { companyId: companyIds },
        attributes: ['companyId', 'licenseWarningDays']
      });
      const settingsMap = new Map(settings.map(s => [s.companyId, s.licenseWarningDays]));

      const expiringLicenses: Array<{ license: License; warningDays: number }> = [];
      for (const license of licenses) {
        if (!license.endDate) continue;
        
        const companyWarningDays = settingsMap.get(license.companyId);
        const warningDays = companyWarningDays !== null && companyWarningDays !== undefined
          ? companyWarningDays
          : DEFAULT_LICENSE_WARNING_DAYS;
        
        const warningDate = new Date(today);
        warningDate.setUTCDate(warningDate.getUTCDate() + warningDays);
        const warningDateOnly = toDateOnly(warningDate);
        const endDateOnly = toDateOnly(license.endDate);
        
        if (endDateOnly >= today && endDateOnly <= warningDateOnly) {
          expiringLicenses.push({ license, warningDays });
        }
      }

      logger.info(`[LicenseBillingWarning Cron] Encontradas ${expiringLicenses.length} licenças próximas do vencimento`);

      for (const { license, warningDays } of expiringLicenses) {
        try {
          const daysUntilExpiry = Math.ceil(
            (toDateOnly(license.endDate!) - today) / (1000 * 60 * 60 * 24)
          );

          logger.info(
            `[LicenseBillingWarning Cron] Licença ${license.id} (Empresa: ${license.company?.name || license.companyId}) ` +
            `vence em ${daysUntilExpiry} dia(s) [config: ${warningDays} dias]. Próximo vencimento: ${license.endDate}`
          );

          const companyEmail = (license.company as Company)?.email ?? null;
          const companyName = (license.company as Company)?.name || String(license.companyId);
          await sendBillingWarningMail({
            companyEmail,
            companyName,
            daysUntilExpiry,
            endDate: license.endDate,
            licenseId: license.id
          });

          try {
            const io = getIO();
            if (io) {
              io.emit(`company-${license.companyId}-licenseExpiring`, {
                daysUntilExpiry,
                endDate: license.endDate,
                licenseId: license.id
              });
            }
          } catch (_) {
            // Socket pode não estar disponível no processo do cron
          }

        } catch (err) {
          logger.error(`[LicenseBillingWarning Cron] Erro ao processar licença ${license.id}:`, err);
        }
      }

      logger.info('[LicenseBillingWarning Cron] Verificação concluída!');
    } catch (err) {
      logger.error('[LicenseBillingWarning Cron] Erro geral:', err);
    }
  });

  logger.info('[LicenseBillingWarning Cron] Agendamento configurado: todos os dias às 9h da manhã');
};

export default licenseBillingWarningCron;
