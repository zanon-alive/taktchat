import {
  getPrivateGuestPath,
  getUnauthenticatedRedirect,
  isPublicAuthPath,
  isPublicMarketingPath,
} from "../publicSitePaths";

describe("isPublicMarketingPath", () => {
  it("reconhece landing, arquivo v1, lgpd e tour", () => {
    expect(isPublicMarketingPath("/landing")).toBe(true);
    expect(isPublicMarketingPath("/landing/v1")).toBe(true);
    expect(isPublicMarketingPath("/lgpd")).toBe(true);
    expect(isPublicMarketingPath("/tour")).toBe(true);
    expect(isPublicMarketingPath("/tour/")).toBe(true);
    expect(isPublicMarketingPath("/p/tour")).toBe(true);
  });

  it("nao trata login nem dashboard como marketing", () => {
    expect(isPublicMarketingPath("/")).toBe(false);
    expect(isPublicMarketingPath("/login")).toBe(false);
    expect(isPublicMarketingPath("/tickets")).toBe(false);
    expect(isPublicMarketingPath("")).toBe(false);
    expect(isPublicMarketingPath(undefined)).toBe(false);
  });
});

describe("isPublicAuthPath", () => {
  it("reconhece login, signup e recuperacao de senha", () => {
    expect(isPublicAuthPath("/login")).toBe(true);
    expect(isPublicAuthPath("/signup")).toBe(true);
    expect(isPublicAuthPath("/signup-partner")).toBe(true);
    expect(isPublicAuthPath("/forgot-password")).toBe(true);
    expect(isPublicAuthPath("/reset-password")).toBe(true);
    expect(isPublicAuthPath("/login/")).toBe(true);
  });

  it("nao trata landing nem painel como auth publico", () => {
    expect(isPublicAuthPath("/")).toBe(false);
    expect(isPublicAuthPath("/landing")).toBe(false);
    expect(isPublicAuthPath("/tickets")).toBe(false);
  });
});

describe("getPrivateGuestPath", () => {
  it("usa /login por padrao", () => {
    expect(getPrivateGuestPath()).toBe("/login");
    expect(getPrivateGuestPath(undefined)).toBe("/login");
  });

  it("respeita guestRedirect da home", () => {
    expect(getPrivateGuestPath("/landing")).toBe("/landing");
  });

  it("no app nativo ignora guestRedirect e vai para login", () => {
    expect(getPrivateGuestPath("/landing", { isNative: true })).toBe("/login");
  });
});

describe("getUnauthenticatedRedirect", () => {
  it("encaminha visitante web da raiz para /landing", () => {
    expect(getUnauthenticatedRedirect("/")).toBe("/landing");
    expect(getUnauthenticatedRedirect("")).toBe("/landing");
  });

  it("no app nativo encaminha a raiz para /login", () => {
    expect(getUnauthenticatedRedirect("/", { isNative: true })).toBe("/login");
  });

  it("rotas privadas sem sessao vao para /login", () => {
    expect(getUnauthenticatedRedirect("/tickets")).toBe("/login");
    expect(getUnauthenticatedRedirect("/tickets", { isNative: true })).toBe(
      "/login"
    );
  });

  it("nao empurra quem ja esta em auth ou marketing", () => {
    expect(getUnauthenticatedRedirect("/login")).toBeNull();
    expect(getUnauthenticatedRedirect("/signup")).toBeNull();
    expect(getUnauthenticatedRedirect("/landing")).toBeNull();
    expect(getUnauthenticatedRedirect("/tour")).toBeNull();
    expect(getUnauthenticatedRedirect("/lgpd")).toBeNull();
    expect(getUnauthenticatedRedirect("/landing", { isNative: true })).toBeNull();
  });
});
