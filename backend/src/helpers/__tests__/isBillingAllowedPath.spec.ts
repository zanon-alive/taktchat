import { isBillingAllowedPath } from "../isBillingAllowedPath";

describe("isBillingAllowedPath", () => {
  it("libera faturas, plano, empresa, subscription e auth", () => {
    expect(isBillingAllowedPath("GET", "/invoices/all")).toBe(true);
    expect(isBillingAllowedPath("GET", "/invoices/12")).toBe(true);
    expect(isBillingAllowedPath("POST", "/subscription")).toBe(true);
    expect(isBillingAllowedPath("GET", "/plans/3")).toBe(true);
    expect(isBillingAllowedPath("GET", "/companies/9")).toBe(true);
    expect(isBillingAllowedPath("GET", "/auth/me")).toBe(true);
    expect(isBillingAllowedPath("DELETE", "/auth/logout")).toBe(true);
    expect(isBillingAllowedPath("POST", "/version")).toBe(true);
  });

  it("bloqueia rotas operacionais", () => {
    expect(isBillingAllowedPath("GET", "/tickets")).toBe(false);
    expect(isBillingAllowedPath("GET", "/whatsapp/?session=0")).toBe(false);
    expect(isBillingAllowedPath("POST", "/companies")).toBe(false);
    expect(isBillingAllowedPath("GET", "/plans")).toBe(false);
  });
});
