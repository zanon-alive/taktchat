import { resolvePublicAssetUrl } from "../../utils/publicAssetUrl";

describe("resolvePublicAssetUrl", () => {
  const backend = "https://api.taktchat.com.br";

  it("não prefixa URL absoluta https", () => {
    const abs = "https://taktchat.com.br/static/media/favicon.ico";
    expect(resolvePublicAssetUrl(backend, abs)).toBe(abs);
  });

  it("monta path relativo sob /public/", () => {
    expect(resolvePublicAssetUrl(backend, "company1/logo.png")).toBe(
      "https://api.taktchat.com.br/public/company1/logo.png"
    );
  });

  it("não duplica /public/ no path", () => {
    expect(resolvePublicAssetUrl(backend, "public/company1/logo.png")).toBe(
      "https://api.taktchat.com.br/public/company1/logo.png"
    );
  });

  it("não duplica se o valor já começa com o backend", () => {
    const full = "https://api.taktchat.com.br/public/x.png";
    expect(resolvePublicAssetUrl(backend, full)).toBe(full);
  });

  it("retorna null para vazio", () => {
    expect(resolvePublicAssetUrl(backend, "")).toBeNull();
    expect(resolvePublicAssetUrl(backend, null)).toBeNull();
  });
});
