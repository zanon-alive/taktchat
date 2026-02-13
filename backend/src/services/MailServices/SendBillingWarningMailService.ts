import { SendMail } from "../../helpers/SendMail";
import logger from "../../utils/logger";

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

export interface BillingWarningParams {
  companyEmail?: string | null;
  companyName: string;
  daysUntilExpiry: number;
  endDate: Date | null;
  licenseId: number;
}

/**
 * Envia e-mail de aviso de vencimento de licença.
 * Só envia se MAIL_HOST estiver configurado; falha silenciosa caso contrário.
 */
export async function sendBillingWarningMail(params: BillingWarningParams): Promise<void> {
  const { companyName, daysUntilExpiry, endDate, licenseId } = params;
  const to = params.companyEmail;
  if (!to || !process.env.MAIL_HOST) {
    if (!process.env.MAIL_HOST) {
      logger.debug("[SendBillingWarningMail] MAIL_HOST não configurado; e-mail não enviado.");
    }
    return;
  }

  const endDateStr = endDate ? new Date(endDate).toLocaleDateString("pt-BR") : "-";
  const subject =
    daysUntilExpiry <= 1
      ? `[${companyName}] Sua licença vence ${daysUntilExpiry === 0 ? "hoje" : "amanhã"}!`
      : `[${companyName}] Sua licença vence em ${daysUntilExpiry} dias`;

  const html = `
    <p>Olá,</p>
    <p>A licença da empresa <strong>${companyName}</strong> está próxima do vencimento.</p>
    <ul>
      <li><strong>Vencimento:</strong> ${endDateStr}</li>
      <li><strong>Dias restantes:</strong> ${daysUntilExpiry}</li>
    </ul>
    <p>Para manter o acesso, realize a renovação em: <a href="${FRONTEND_URL}/licenses">${FRONTEND_URL}/licenses</a></p>
    <p>Qualquer dúvida, entre em contato com o suporte.</p>
  `;

  try {
    await SendMail({
      to,
      subject,
      html,
      text: `Licença vence em ${daysUntilExpiry} dia(s). Vencimento: ${endDateStr}. Acesse ${FRONTEND_URL}/licenses para renovar.`
    });
    logger.info(`[SendBillingWarningMail] E-mail enviado para ${to} (licença ${licenseId})`);
  } catch (err: any) {
    logger.error(`[SendBillingWarningMail] Erro ao enviar e-mail para ${to}:`, err?.message || err);
  }
}
