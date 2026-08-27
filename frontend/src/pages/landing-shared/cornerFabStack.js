export const COOKIE_BANNER_SELECTOR = ".taktchat-cookie-banner";
export const SITE_CHAT_BUTTON_ID = "taktchat-widget-button";
export const FAB_SIZE = 56;
export const FAB_GAP = 12;
export const FAB_EDGE = 16;
export const SITE_CHAT_DEFAULT_BOTTOM = 20;
export const SITE_CHAT_PANEL_GAP = 70;

export function computeCornerStack({
  cookieHeight = 0,
  siteChatPresent = false,
  minBottom = FAB_EDGE,
} = {}) {
  const cookie = Math.max(0, Number(cookieHeight) || 0);
  const whatsappBottom = cookie + Math.max(FAB_EDGE, Number(minBottom) || FAB_EDGE);
  const siteChatBottom = siteChatPresent
    ? whatsappBottom + FAB_SIZE + FAB_GAP
    : cookie + SITE_CHAT_DEFAULT_BOTTOM;
  return {
    whatsappBottom,
    siteChatBottom,
    siteChatPanelBottom: siteChatBottom + SITE_CHAT_PANEL_GAP,
  };
}

export function fabBottomCss(whatsappBottom) {
  const bottom = Math.max(0, Number(whatsappBottom) || 0);
  return `max(${bottom}px, env(safe-area-inset-bottom, 0px))`;
}

export function siteChatBottomCss(siteChatBottom) {
  const bottom = Math.max(0, Number(siteChatBottom) || 0);
  return `calc(${bottom}px + env(safe-area-inset-bottom, 0px))`;
}
