import axios from "axios";

function getInternalBaseUrl() {
  return String(process.env.LABEL_SYNC_INTERNAL_URL || "").replace(/\/+$/, "");
}

function getInternalToken() {
  return String(process.env.LABEL_SYNC_INTERNAL_TOKEN || "");
}

function getHeaders() {
  const token = getInternalToken();
  return token ? { "X-Internal-Token": token } : {};
}

export function isLabelSyncProxyEnabled() {
  return !!getInternalBaseUrl();
}

export async function internalGetDeviceLabels(params: { companyId: number; whatsappId?: number }) {
  const baseUrl = getInternalBaseUrl();
  if (!baseUrl) throw new Error("LABEL_SYNC_INTERNAL_URL não configurada");

  const res = await axios.get(`${baseUrl}/internal/whatsapp-web/labels`, {
    headers: getHeaders(),
    params
  });
  return res.data;
}

export async function internalFullLabelSync(params: { companyId: number; whatsappId: number }) {
  const baseUrl = getInternalBaseUrl();
  if (!baseUrl) throw new Error("LABEL_SYNC_INTERNAL_URL não configurada");

  const res = await axios.post(`${baseUrl}/internal/whatsapp-web/labels/full-sync`, null, {
    headers: getHeaders(),
    params
  });
  return res.data;
}

