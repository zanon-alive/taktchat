import { getNumberSupport } from "../../config";

export const SUPPORT_WHATSAPP_FALLBACK = "5514996870843";
export const SUPPORT_WHATSAPP_INTEREST_TEXT =
  "Olá! Vi o TaktChat e quero conhecer. Podem me ajudar?";

export function getSupportWhatsAppNumber() {
  return String(getNumberSupport() || SUPPORT_WHATSAPP_FALLBACK).replace(/\D/g, "");
}

export function getSupportWhatsAppUrl(text = SUPPORT_WHATSAPP_INTEREST_TEXT) {
  const number = getSupportWhatsAppNumber();
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}

export function openSupportWhatsApp(text) {
  window.open(getSupportWhatsAppUrl(text), "_blank", "noopener,noreferrer");
}
