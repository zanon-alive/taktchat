import { SendMail } from "../../helpers/SendMail";
import logger from "../../utils/logger";

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

/**
 * Envia e-mail de boas-vindas após cadastro via link do parceiro.
 * Só envia se MAIL_HOST estiver configurado; falha silenciosa caso contrário.
 */
export async function sendWelcomePartnerSignupMail(params: {
  to: string;
  companyName: string;
  adminName: string;
  trialDays: number;
}): Promise<void> {
  const { to, companyName, adminName, trialDays } = params;
  if (!to || !process.env.MAIL_HOST) {
    if (!process.env.MAIL_HOST) {
      logger.debug("[SendWelcomePartnerSignupMail] MAIL_HOST não configurado; e-mail não enviado.");
    }
    return;
  }

  const subject = `Bem-vindo(a) - ${companyName}`;
  const html = `
    <p>Olá, <strong>${adminName}</strong>!</p>
    <p>O cadastro da empresa <strong>${companyName}</strong> foi realizado com sucesso.</p>
    <p>Você tem <strong>${trialDays} dias</strong> de período de teste. Aproveite para explorar a plataforma.</p>
    <p>Para acessar: <a href="${FRONTEND_URL}/login">${FRONTEND_URL}/login</a></p>
    <p>Qualquer dúvida, entre em contato com seu parceiro ou com o suporte.</p>
  `;

  try {
    await SendMail({
      to,
      subject,
      html,
      text: `Bem-vindo! Cadastro da empresa ${companyName} realizado. Você tem ${trialDays} dias de trial. Acesse ${FRONTEND_URL}/login`
    });
    logger.info(`[SendWelcomePartnerSignupMail] E-mail de boas-vindas enviado para ${to}`);
  } catch (err: any) {
    logger.error(`[SendWelcomePartnerSignupMail] Erro ao enviar e-mail para ${to}:`, err?.message || err);
  }
}
