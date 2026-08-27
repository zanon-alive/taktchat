import {
  FAB_EDGE,
  FAB_GAP,
  FAB_SIZE,
  SITE_CHAT_DEFAULT_BOTTOM,
  SITE_CHAT_PANEL_GAP,
  computeCornerStack,
} from "../cornerFabStack";

describe("computeCornerStack", () => {
  it("mantém o FAB no canto quando não há banner nem chat do site", () => {
    expect(computeCornerStack()).toEqual({
      whatsappBottom: FAB_EDGE,
      siteChatBottom: SITE_CHAT_DEFAULT_BOTTOM,
      siteChatPanelBottom: SITE_CHAT_DEFAULT_BOTTOM + SITE_CHAT_PANEL_GAP,
    });
  });

  it("sobe os botões pela altura do banner de cookies", () => {
    expect(computeCornerStack({ cookieHeight: 120 })).toEqual({
      whatsappBottom: 136,
      siteChatBottom: 140,
      siteChatPanelBottom: 210,
    });
  });

  it("empilha o chat do site acima do FAB do WhatsApp", () => {
    expect(computeCornerStack({ siteChatPresent: true })).toEqual({
      whatsappBottom: FAB_EDGE,
      siteChatBottom: FAB_EDGE + FAB_SIZE + FAB_GAP,
      siteChatPanelBottom: FAB_EDGE + FAB_SIZE + FAB_GAP + SITE_CHAT_PANEL_GAP,
    });
  });
});
