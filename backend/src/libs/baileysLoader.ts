/**
 * Loader central para @whiskeysockets/baileys
 * 
 * Este módulo é o único ponto que faz import dinâmico do Baileys (módulo ESM).
 * Todos os outros arquivos devem usar getBaileys() ou getBaileysLogger() 
 * em vez de importar diretamente do Baileys.
 */

let baileysCache: typeof import("@whiskeysockets/baileys") | null = null;
let baileysLoggerCache: typeof import("@whiskeysockets/baileys/lib/Utils/logger") | null = null;

/**
 * Carrega o módulo @whiskeysockets/baileys dinamicamente.
 * Usa cache para evitar recarregar múltiplas vezes.
 * Usa Function constructor para evitar que TypeScript compile import() para require()
 */
export async function getBaileys(): Promise<typeof import("@whiskeysockets/baileys")> {
  if (!baileysCache) {
    // Usar Function constructor para criar import dinâmico que não seja compilado pelo TypeScript
    const dynamicImport = new Function("specifier", "return import(specifier)");
    baileysCache = await dynamicImport("@whiskeysockets/baileys");
  }
  return baileysCache;
}

/**
 * Carrega o logger do Baileys dinamicamente.
 * Usa cache para evitar recarregar múltiplas vezes.
 * Usa Function constructor para evitar que TypeScript compile import() para require()
 */
export async function getBaileysLogger(): Promise<typeof import("@whiskeysockets/baileys/lib/Utils/logger")> {
  if (!baileysLoggerCache) {
    // Usar Function constructor para criar import dinâmico que não seja compilado pelo TypeScript
    // IMPORTANTE: Em módulos ESM, o Node.js requer a extensão .js explícita
    const dynamicImport = new Function("specifier", "return import(specifier)");
    baileysLoggerCache = await dynamicImport("@whiskeysockets/baileys/lib/Utils/logger.js");
  }
  return baileysLoggerCache;
}

// Re-exportar tipos para facilitar uso em outros arquivos
export type {
  WASocket,
  WAMessage,
  WAMessageKey,
  AuthenticationState,
  AuthenticationCreds,
  SignalDataTypeMap,
  DisconnectReason,
  Browsers,
  Chat,
  Contact,
  GroupMetadata,
  ConnectionState,
  PresenceData,
  BaileysEventEmitter,
  WAMessageCursor,
  proto,
  AnyMessageContent,
  WAPresence,
  MessageUpsertType,
} from "@whiskeysockets/baileys";
