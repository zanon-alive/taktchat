import { createLicenseSupabaseClient } from "../GetWhatsapp";

describe("createLicenseSupabaseClient", () => {
  const prevUrl = process.env.LICENSE_SUPABASE_URL;
  const prevKey = process.env.LICENSE_SUPABASE_ANON_KEY;

  afterEach(() => {
    if (prevUrl === undefined) delete process.env.LICENSE_SUPABASE_URL;
    else process.env.LICENSE_SUPABASE_URL = prevUrl;
    if (prevKey === undefined) delete process.env.LICENSE_SUPABASE_ANON_KEY;
    else process.env.LICENSE_SUPABASE_ANON_KEY = prevKey;
  });

  it("não lança ao inicializar com URL/key e transport seguro", () => {
    process.env.LICENSE_SUPABASE_URL = "https://example.supabase.co";
    process.env.LICENSE_SUPABASE_ANON_KEY = "test-anon-key";
    expect(() => createLicenseSupabaseClient()).not.toThrow();
  });

  it("lança se credenciais estiverem ausentes", () => {
    delete process.env.LICENSE_SUPABASE_URL;
    delete process.env.LICENSE_SUPABASE_ANON_KEY;
    expect(() => createLicenseSupabaseClient()).toThrow(/LICENSE_SUPABASE/);
  });
});
