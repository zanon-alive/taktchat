import { getPrivateGuestPath, isPublicMarketingPath } from "../publicSitePaths";

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

describe("getPrivateGuestPath", () => {
  it("usa /login por padrao", () => {
    expect(getPrivateGuestPath()).toBe("/login");
    expect(getPrivateGuestPath(undefined)).toBe("/login");
  });

  it("respeita guestRedirect da home", () => {
    expect(getPrivateGuestPath("/landing")).toBe("/landing");
  });
});
