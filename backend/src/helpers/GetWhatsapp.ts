/**
 * @TercioSantos-3 |
 * *Whatsapp |
 * @descrição:*Whatsapp
 */
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import UpdateOneSettingService from "../services/SettingServices/UpdateOneSettingService";
import axios from "axios";
import GetSettingService from "../services/SettingServices/GetSettingService";
import AddSettingService from "../services/SettingServices/AddSettingService";
import logger from "../utils/logger";

type indexPost = {
  cadastro_id: number;
  status: boolean;
  company_token: string;
  backend_ip: string;
  backend_url: string;
  frontend_url: string;
};

const y_n = process.env.COMPANY_TOKEN;

let licenseClient: SupabaseClient | null = null;

function getLicenseSupabaseConfig(): { url: string; key: string } | null {
  const url = (process.env.LICENSE_SUPABASE_URL || "").trim();
  const key = (process.env.LICENSE_SUPABASE_ANON_KEY || "").trim();
  if (!url || !key) {
    return null;
  }
  return { url, key };
}

/** Realtime só precisa de `ws` em runtimes sem WebSocket nativo (ex.: Node < 22). */
export function createLicenseSupabaseClient(
  url?: string,
  key?: string
): SupabaseClient {
  const resolved = url && key ? { url, key } : getLicenseSupabaseConfig();
  if (!resolved) {
    throw new Error(
      "LICENSE_SUPABASE_URL e LICENSE_SUPABASE_ANON_KEY são obrigatórios"
    );
  }

  const options: Record<string, unknown> = {};
  if (typeof WebSocket === "undefined") {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const ws = require("ws");
    options.realtime = { transport: ws };
  }

  return createClient(resolved.url, resolved.key, options as any);
}

function getLicenseClient(): SupabaseClient | null {
  const cfg = getLicenseSupabaseConfig();
  if (!cfg) {
    return null;
  }
  if (!licenseClient) {
    licenseClient = createLicenseSupabaseClient(cfg.url, cfg.key);
  }
  return licenseClient;
}

const getIp = async () => {
  const { data } = await axios.get("https://api.ipify.org?format=json");
  return data.ip;
};

export const GetWhatsapp = async () => {
  try {
    const client = getLicenseClient();
    if (!client) {
      logger.warn(
        "GetWhatsapp: LICENSE_SUPABASE_URL/LICENSE_SUPABASE_ANON_KEY ausentes; pulando verificação de licença."
      );
      return;
    }

    const ip = await getIp();
    const key = await getR("wtV");

    if (key === "enabled") {
      await AddSettingService();
    }

    const { data } = await client
      .from("cadastros")
      .select("id, ip_instalacao, company_token")
      .eq("ip_instalacao", ip);

    const sendInfo = {
      cadastro_id: data.length !== 0 ? data[0].id : 0,
      status: data.length !== 0 ? true : false,
      company_token: y_n,
      backend_ip: ip,
      backend_url: process.env.BACKEND_URL,
      frontend_url: process.env.FRONTEND_URL
    } as indexPost;

    if (data.length === 0) {
      await UpdateR("enabled", false, ip);
      PostWhatsapp(sendInfo, "404");
      CheckWhatsapp(ip, "i_n_r");
    } else if (data[0].company_token !== y_n) {
      await UpdateR("enabled", false, ip);
      PostWhatsapp(sendInfo, "401");
      CheckWhatsapp(ip, "t_f");
    } else {
      await UpdateR("disabled", null, ip);
    }
  } catch (error) {
    logger.warn("GetWhatsapp: falha na verificação de licença (não derruba o app).");
  }
};

const UpdateR = async (status: string, _value: any, _ip: string) => {
  await UpdateOneSettingService({ key: "wtV", value: status });
};

const getR = async (key: string) => {
  return await GetSettingService({ key });
};

const PostWhatsapp = async (info: indexPost, _reason: string) => {
  try {
    const client = getLicenseClient();
    if (!client) return;
    const { error } = await client.from("whatsapp").insert([
      {
        cadastro_id: info.cadastro_id,
        status: info.status,
        company_token: info.company_token,
        backend_ip: info.backend_ip,
        backend_url: info.backend_url,
        frontend_url: info.frontend_url
      }
    ]);
    if (error) {
      logger.warn(`GetWhatsapp PostWhatsapp: ${error.message}`);
    }
  } catch (_error) {
    // não derruba o processo
  }
};

const CheckWhatsapp = async (ip: string, status: string) => {
  try {
    const client = getLicenseClient();
    if (!client) return;

    const { data } = await client.from("key_code").select("key,code,ip");
    const match = await matchWhatsapp(ip);

    if (data !== null) {
      if (status === "i_n_r" && match.code !== null) {
        rejectUnauthorizedInstall(ip, status);
      }
      if (ip === data[0].ip && match.code !== null) {
        if (match.key === data[0].key && match.code === data[0].code) {
          rejectUnauthorizedInstall(ip, status);
        }
      }
    }
  } catch (error) {
    logger.warn("GetWhatsapp CheckWhatsapp: erro ao validar chave.");
  }
};

const matchWhatsapp = async (ip: string) => {
  const client = getLicenseClient();
  if (!client) {
    return { code: "ok", key: "ok" };
  }
  const { data } = await client.from("t_invalidos").select("ip, key, code");
  let key = "ok";
  let code = "ok";
  if (data && data.length > 0) {
    key = data[0].key;
    code = data[0].code;
  }
  return { code, key };
};

/** Antes executava rm -rf em disco; agora só registra (sem efeito colateral). */
const rejectUnauthorizedInstall = (ip: string, status: string) => {
  logger.warn(
    `GetWhatsapp: instalação marcada como não autorizada (ip=${ip}, status=${status}). Nenhuma ação destrutiva foi executada.`
  );
};
