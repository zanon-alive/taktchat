import { openApi } from "../../services/api";

export const SUPPORT_WHATSAPP_SETTING_KEY = "supportWhatsAppNumber";
export const SUPPORT_WHATSAPP_INTEREST_TEXT =
  "Olá! Vi o TaktChat e quero conhecer. Podem me ajudar?";

export function digitsOnly(value) {
  return String(value || "").replace(/\D/g, "");
}

export function getSupportWhatsAppUrl(number, text = SUPPORT_WHATSAPP_INTEREST_TEXT) {
  const digits = digitsOnly(number);
  if (!digits) {
    return null;
  }
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}

export function openSupportWhatsApp(number, text) {
  const url = getSupportWhatsAppUrl(number, text);
  if (!url || typeof window === "undefined") {
    return;
  }
  window.open(url, "_blank", "noopener,noreferrer");
}

let cachedNumber;
let pendingFetch;

export function resetSupportWhatsAppCache() {
  cachedNumber = undefined;
  pendingFetch = undefined;
}

export async function fetchSupportWhatsAppNumber() {
  if (cachedNumber !== undefined) {
    return cachedNumber;
  }
  if (!pendingFetch) {
    pendingFetch = openApi
      .request({
        url: `/public-settings/${SUPPORT_WHATSAPP_SETTING_KEY}`,
        method: "GET",
        params: { token: "wtV" },
      })
      .then((response) => digitsOnly(response?.data))
      .catch(() => "")
      .then((digits) => {
        cachedNumber = digits;
        return digits;
      });
  }
  return pendingFetch;
}
