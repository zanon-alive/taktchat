const fs = require("fs");
const path = require("path");

import {
  isStandaloneDisplay,
  isTicketsPath,
  PWA_START_URL,
  shouldUseMobileInboxChrome,
} from "../mobileInbox";

describe("isTicketsPath", () => {
  it("reconhece lista e ticket aberto", () => {
    expect(isTicketsPath("/tickets")).toBe(true);
    expect(isTicketsPath("/tickets/123")).toBe(true);
    expect(isTicketsPath("/tickets/abc-uuid")).toBe(true);
  });

  it("ignora query e rejeita outras rotas", () => {
    expect(isTicketsPath("/tickets?tab=open")).toBe(true);
    expect(isTicketsPath("/")).toBe(false);
    expect(isTicketsPath("/connections")).toBe(false);
    expect(isTicketsPath("/ticket")).toBe(false);
    expect(isTicketsPath("")).toBe(false);
  });
});

describe("isStandaloneDisplay", () => {
  it("é verdadeiro quando matchMedia reporta standalone", () => {
    const matchMedia = jest.fn((query) => ({
      matches: query.includes("standalone"),
    }));
    expect(isStandaloneDisplay(matchMedia)).toBe(true);
    expect(matchMedia).toHaveBeenCalledWith("(display-mode: standalone)");
  });

  it("é falso sem matchMedia ou sem standalone", () => {
    expect(isStandaloneDisplay(null)).toBe(false);
    expect(isStandaloneDisplay(() => ({ matches: false }))).toBe(false);
  });
});

describe("shouldUseMobileInboxChrome", () => {
  it("ativa em /tickets no mobile", () => {
    expect(
      shouldUseMobileInboxChrome({
        pathname: "/tickets",
        isMdUp: false,
        standalone: false,
      })
    ).toBe(true);
    expect(
      shouldUseMobileInboxChrome({
        pathname: "/tickets/123",
        isMdUp: false,
        standalone: false,
      })
    ).toBe(true);
  });

  it("nao ativa em /tickets no desktop do navegador", () => {
    expect(
      shouldUseMobileInboxChrome({
        pathname: "/tickets",
        isMdUp: true,
        standalone: false,
      })
    ).toBe(false);
  });

  it("ativa em /tickets no PWA standalone mesmo em md+", () => {
    expect(
      shouldUseMobileInboxChrome({
        pathname: "/tickets",
        isMdUp: true,
        standalone: true,
      })
    ).toBe(true);
  });

  it("nao ativa dashboard nem outras rotas no mobile", () => {
    expect(
      shouldUseMobileInboxChrome({
        pathname: "/",
        isMdUp: false,
        standalone: false,
      })
    ).toBe(false);
    expect(
      shouldUseMobileInboxChrome({
        pathname: "/connections",
        isMdUp: false,
        standalone: true,
      })
    ).toBe(false);
  });
});

describe("PWA manifest da inbox", () => {
  const manifest = JSON.parse(
    fs.readFileSync(
      path.join(__dirname, "../../../public/manifest.json"),
      "utf8"
    )
  );

  it("abre em /tickets", () => {
    expect(PWA_START_URL).toBe("/tickets");
    expect(manifest.start_url).toBe("/tickets");
    expect(manifest.shortcuts[0].url).toBe("/tickets");
  });
});
