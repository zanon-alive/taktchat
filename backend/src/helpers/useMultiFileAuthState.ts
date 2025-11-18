import { proto } from "@whiskeysockets/baileys";
import {
  AuthenticationCreds,
  AuthenticationState,
  SignalDataTypeMap
} from "@whiskeysockets/baileys";
import { initAuthCreds } from "@whiskeysockets/baileys";
import { BufferJSON } from "@whiskeysockets/baileys";
import cacheLayer from "../libs/cache";
import Whatsapp from "../models/Whatsapp";
import fs from "fs";
import path from "path";

export const useMultiFileAuthState = async (
  whatsapp: Whatsapp
): Promise<{ state: AuthenticationState; saveCreds: () => Promise<void> }> => {
  const driver = (process.env.SESSIONS_DRIVER || "").toLowerCase() || (process.env.REDIS_URI ? "redis" : "fs");

  // Base dir padrão: private/sessions/<companyId>/<whatsappId>
  const baseDir = path.resolve(
    process.cwd(),
    process.env.SESSIONS_DIR || "private/sessions",
    String(whatsapp.companyId || "0"),
    String(whatsapp.id)
  );

  // Log informativo (uma vez por instância) para diagnosticar driver/dir
  try {
    console.log(
      `[BaileysAuth] driver=${driver} baseDir=${baseDir} whatsappId=${whatsapp.id} companyId=${whatsapp.companyId}`
    );
  } catch {}

  const ensureDir = async () => {
    if (driver === "fs") {
      await fs.promises.mkdir(baseDir, { recursive: true }).catch(() => {});
    }
  };

  // Em Windows, nomes de arquivos não podem conter caracteres reservados. Também evitamos '@' e '::' usados pelo Baileys em IDs.
  const sanitizeFileName = (name: string) =>
    name
      .replace(/[<>:\\"/\\|?*]/g, "_") // caracteres inválidos gerais
      .replace(/@/g, "_at_")
      .replace(/::/g, "__");

  const fsPathFor = (file: string) => path.join(baseDir, `${sanitizeFileName(file)}.json`);

  const writeData = async (data: any, file: string) => {
    try {
      if (driver === "redis") {
        await cacheLayer.set(
          `sessions:${whatsapp.id}:${file}`,
          JSON.stringify(data, BufferJSON.replacer)
        );
      } else {
        await ensureDir();
        const p = fsPathFor(file);
        await fs.promises.writeFile(p, JSON.stringify(data, BufferJSON.replacer), "utf-8");
      }
    } catch (error) {
      console.log("writeData error", error);
      return null;
    }
  };

  const readData = async (file: string) => {
    try {
      if (driver === "redis") {
        const data = await cacheLayer.get(`sessions:${whatsapp.id}:${file}`);
        return data ? JSON.parse(data, BufferJSON.reviver) : null;
      } else {
        const p = fsPathFor(file);
        try {
          const raw = await fs.promises.readFile(p, "utf-8");
          return JSON.parse(raw, BufferJSON.reviver);
        } catch {
          return null;
        }
      }
    } catch (error) {
      return null;
    }
  };

  const removeData = async (file: string) => {
    try {
      if (driver === "redis") {
        await cacheLayer.del(`sessions:${whatsapp.id}:${file}`);
      } else {
        const p = fsPathFor(file);
        await fs.promises.unlink(p).catch(() => {});
      }
    } catch {}
  };

  // Tentar carregar credenciais salvas
  const savedCreds = await readData("creds");
  
  // Função para validar integridade das credenciais
  const validateCredsIntegrity = (creds: any): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (!creds || typeof creds !== 'object') {
      errors.push('Credenciais não são um objeto válido');
      return { valid: false, errors };
    }
    
    // Verificar campos essenciais para credenciais válidas (após escanear QR)
    if (creds.me?.id) {
      // Se tem MeId, deve ter outros campos essenciais
      if (!creds.signedIdentityKey || !creds.signedPreKey) {
        errors.push('Credenciais com MeId mas sem signedIdentityKey ou signedPreKey');
      }
      if (!creds.registrationId || typeof creds.registrationId !== 'number') {
        errors.push('Credenciais com MeId mas registrationId inválido');
      }
      if (!creds.signalIdentities || !Array.isArray(creds.signalIdentities) || creds.signalIdentities.length === 0) {
        errors.push('Credenciais com MeId mas signalIdentities ausente ou inválido');
      }
    }
    
    return { valid: errors.length === 0, errors };
  };
  
  // Log detalhado sobre carregamento e validação de integridade
  try {
    const credsPath = fsPathFor("creds");
    const credsExists = driver === "fs" ? await fs.promises.access(credsPath).then(() => true).catch(() => false) : false;
    
    if (savedCreds) {
      const meId = savedCreds.me?.id || 'N/A';
      const registered = savedCreds.registered || false;
      
      // Validar integridade das credenciais
      const integrity = validateCredsIntegrity(savedCreds);
      
      if (integrity.valid) {
        console.log(
          `[BaileysAuth] ✅ Credenciais carregadas e validadas para whatsappId=${whatsapp.id} | MeId: ${meId} | Registrado: ${registered} | Arquivo: ${credsPath}`
        );
      } else {
        console.log(
          `[BaileysAuth] ⚠️  Credenciais carregadas mas COM PROBLEMAS DE INTEGRIDADE para whatsappId=${whatsapp.id} | MeId: ${meId} | Erros: ${integrity.errors.join(', ')}`
        );
        console.log(
          `[BaileysAuth] ⚠️  Recomendado: Limpar sessão e escanear QR code novamente para whatsappId=${whatsapp.id}`
        );
        // Não invalidar automaticamente, mas alertar - pode ser um caso legítimo (ex: credenciais iniciais)
      }
    } else {
      if (credsExists && driver === "fs") {
        console.log(
          `[BaileysAuth] ⚠️  Arquivo creds.json existe mas não foi possível carregar (possivelmente corrompido) para whatsappId=${whatsapp.id} | Arquivo: ${credsPath}`
        );
        console.log(
          `[BaileysAuth] ⚠️  Tentando remover arquivo corrompido e inicializar novas credenciais para whatsappId=${whatsapp.id}`
        );
        // Tentar remover arquivo corrompido
        try {
          await removeData("creds");
          console.log(`[BaileysAuth] ✅ Arquivo corrompido removido para whatsappId=${whatsapp.id}`);
        } catch (err: any) {
          console.log(`[BaileysAuth] ⚠️  Erro ao remover arquivo corrompido: ${err?.message}`);
        }
      } else {
        console.log(
          `[BaileysAuth] ❌ Nenhuma credencial salva encontrada para whatsappId=${whatsapp.id} | Arquivo não existe: ${credsPath} | Inicializando novas credenciais.`
        );
      }
    }
  } catch (err: any) {
    console.log(`[BaileysAuth] ⚠️  Erro ao verificar credenciais: ${err?.message}`);
  }

  const creds: AuthenticationCreds = savedCreds || initAuthCreds();

  return {
    state: {
      creds,
      keys: {
        get: async (type, ids) => {
          const data: { [_: string]: SignalDataTypeMap[typeof type] } = {};
          await Promise.all(
            ids.map(async id => {
              let value = await readData(`${type}-${id}`);
              if (type === "app-state-sync-key" && value) {
                value = proto.Message.AppStateSyncKeyData.fromObject(value);
              }

              data[id] = value;
            })
          );

          return data;
        },
        set: async data => {
          const tasks: Promise<void>[] = [];
          for (const category in data) {
            for (const id in data[category]) {
              const value = data[category][id];
              const file = `${category}-${id}`;
              tasks.push(value ? writeData(value, file) : removeData(file));
            }
          }

          await Promise.all(tasks);
        }
      }
    },
    saveCreds: () => {
      return writeData(creds, "creds");
    }
  };
};