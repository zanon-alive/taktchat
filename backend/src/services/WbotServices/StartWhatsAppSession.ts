import { initWASocket, removeWbot } from "../../libs/wbot";
import Whatsapp from "../../models/Whatsapp";
import { wbotMessageListener } from "./wbotMessageListener";
import { getIO } from "../../libs/socket";
import wbotMonitor from "./wbotMonitor";
import logger from "../../utils/logger";
import * as Sentry from "@sentry/node";

// Mapa para evitar múltiplas tentativas simultâneas de conexão para o mesmo whatsappId
const connectingMap = new Map<number, boolean>();

/**
 * Limpa o mapa de conexões em andamento para um whatsappId específico
 * Útil quando uma conexão falha e precisa ser reiniciada
 */
export const clearConnectingMap = (whatsappId: number): void => {
  if (connectingMap.has(whatsappId)) {
    connectingMap.delete(whatsappId);
    logger.debug(`[StartSession] ✅ Mapa de conexões limpo para whatsappId=${whatsappId}`);
  }
};

export const StartWhatsAppSession = async (
  whatsapp: Whatsapp,
  companyId: number
): Promise<void> => {
  // Verificar se já está tentando conectar este whatsappId
  if (connectingMap.get(whatsapp.id)) {
    logger.warn(`[StartSession] ⚠️ Já existe tentativa de conexão em andamento para whatsappId=${whatsapp.id}`);
    logger.warn(`[StartSession] ⚠️ Ignorando nova tentativa para evitar múltiplas conexões concorrentes`);
    return;
  }
  
  // Marcar como conectando
  connectingMap.set(whatsapp.id, true);
  
  try {
    // Remover sessão existente antes de iniciar nova (evita conflitos)
    try {
      await removeWbot(whatsapp.id, false);
      logger.info(`[StartSession] Sessão anterior removida (se existia) para whatsappId=${whatsapp.id}`);
      
      // Aguardar um pouco para garantir limpeza completa
      await new Promise(resolve => setTimeout(resolve, 2000));
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
      logger.error(`[StartSession] Erro ao inicializar socket para whatsappId=${whatsapp.id}:`, err);
    } finally {
      // Sempre remover do mapa de conexões em andamento
      connectingMap.delete(whatsapp.id);
      logger.debug(`[StartSession] Removido do mapa de conexões para whatsappId=${whatsapp.id}`);
    }
  } catch (err) {
    // Em caso de erro antes de tentar conectar, remover do mapa
    connectingMap.delete(whatsapp.id);
    Sentry.captureException(err);
    logger.error(`[StartSession] Erro fatal ao iniciar sessão para whatsappId=${whatsapp.id}:`, err);
  }
};
