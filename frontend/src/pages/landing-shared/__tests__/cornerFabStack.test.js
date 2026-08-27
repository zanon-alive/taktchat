import {
  FAB_EDGE,
  FAB_GAP,
  FAB_SIZE,
  SITE_CHAT_DEFAULT_BOTTOM,
  SITE_CHAT_PANEL_GAP,
  computeCornerStack,
  fabBottomCss,
  siteChatBottomCss,
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

  it("combina banner, chat do site e minBottom do tour", () => {
    expect(
      computeCornerStack({ cookieHeight: 120, siteChatPresent: true, minBottom: 88 })
    ).toEqual({
      whatsappBottom: 208,
      siteChatBottom: 276,
      siteChatPanelBottom: 346,
    });
  });

  it("soma safe-area no CSS do FAB e do chat do site", () => {
    expect(fabBottomCss(208)).toBe("max(208px, env(safe-area-inset-bottom, 0px))");
    expect(siteChatBottomCss(276)).toBe("calc(276px + env(safe-area-inset-bottom, 0px))");
  });
});
