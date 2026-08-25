import { createLicenseSupabaseClient } from "../GetWhatsapp";

describe("createLicenseSupabaseClient", () => {
  it("não lança no Node 20 ao inicializar o client com transport ws", () => {
    expect(() => createLicenseSupabaseClient()).not.toThrow();
  });
});
