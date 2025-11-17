import { initWASocket, removeWbot } from "../../libs/wbot";
import Whatsapp from "../../models/Whatsapp";
import { wbotMessageListener } from "./wbotMessageListener";
import { getIO } from "../../libs/socket";
import wbotMonitor from "./wbotMonitor";
import logger from "../../utils/logger";
import * as Sentry from "@sentry/node";

export const StartWhatsAppSession = async (
  whatsapp: Whatsapp,
  companyId: number
): Promise<void> => {
  // Remover sessão existente antes de iniciar nova (evita conflitos)
  try {
    await removeWbot(whatsapp.id, false);
    logger.info(`[StartSession] Sessão anterior removida (se existia) para whatsappId=${whatsapp.id}`);
  } catch (err) {
    // Ignorar erros se não houver sessão anterior
    logger.debug(`[StartSession] Nenhuma sessão anterior para remover: ${err?.message}`);
  }

  await whatsapp.update({ status: "OPENING" });

  const io = getIO();
  io.of(`/workspace-${companyId}`)
    .emit(`company-${companyId}-whatsappSession`, {
      action: "update",
      session: whatsapp
    });

  try {
    const wbot = await initWASocket(whatsapp);
   
    if (wbot.id) {
      wbotMessageListener(wbot, companyId);
      wbotMonitor(wbot, whatsapp, companyId);
    }
  } catch (err) {
    Sentry.captureException(err);
    logger.error(err);
  }
};
