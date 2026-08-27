import {
  isAllowedCorsOrigin,
  isLocalDevFrontendOrigin
} from "../isAllowedCorsOrigin";

describe("isLocalDevFrontendOrigin", () => {
  it("aceita localhost e LAN", () => {
    expect(isLocalDevFrontendOrigin("http://localhost:3000")).toBe(true);
    expect(isLocalDevFrontendOrigin("http://192.168.18.184:3000")).toBe(true);
    expect(isLocalDevFrontendOrigin("http://10.0.0.5:3000")).toBe(true);
  });

  it("rejeita origem de producao", () => {
    expect(isLocalDevFrontendOrigin("https://taktchat.com.br")).toBe(false);
    expect(isLocalDevFrontendOrigin("not-a-url")).toBe(false);
  });
});

describe("isAllowedCorsOrigin", () => {
  const allowed = ["http://localhost:3000"];

  it("libera lista explicita e ausencia de origin", () => {
    expect(isAllowedCorsOrigin(undefined, allowed, "development")).toBe(true);
    expect(isAllowedCorsOrigin("http://localhost:3000", allowed, "production")).toBe(
      true
    );
  });

  it("libera LAN so fora de production", () => {
    expect(
      isAllowedCorsOrigin("http://192.168.18.184:3000", allowed, "development")
    ).toBe(true);
    expect(
      isAllowedCorsOrigin("http://192.168.18.184:3000", allowed, "production")
    ).toBe(false);
  });
});
