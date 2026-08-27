import { openApi } from "../../../services/api";
import {
  SUPPORT_WHATSAPP_INTEREST_TEXT,
  digitsOnly,
  fetchSupportWhatsAppNumber,
  getSupportWhatsAppUrl,
  openSupportWhatsApp,
  resetSupportWhatsAppCache,
} from "../supportWhatsApp";

jest.mock("../../../services/api", () => ({
  openApi: {
    request: jest.fn(),
  },
}));

describe("supportWhatsApp", () => {
  beforeEach(() => {
    resetSupportWhatsAppCache();
    openApi.request.mockReset();
  });

  it("monta a URL só com dígitos da settings", () => {
    expect(digitsOnly("55 14 99999-0000")).toBe("5514999990000");
    expect(getSupportWhatsAppUrl("55 14 99999-0000")).toBe(
      `https://wa.me/5514999990000?text=${encodeURIComponent(SUPPORT_WHATSAPP_INTEREST_TEXT)}`
    );
  });

  it("não inventa número quando a settings está vazia", () => {
    expect(getSupportWhatsAppUrl("")).toBeNull();
    expect(getSupportWhatsAppUrl(null)).toBeNull();
    const open = jest.spyOn(window, "open").mockImplementation(() => null);
    openSupportWhatsApp("");
    expect(open).not.toHaveBeenCalled();
    open.mockRestore();
  });

  it("busca o número na API pública e cacheia", async () => {
    openApi.request.mockResolvedValue({ data: "55 14 98888-0000" });
    await expect(fetchSupportWhatsAppNumber()).resolves.toBe("5514988880000");
    await expect(fetchSupportWhatsAppNumber()).resolves.toBe("5514988880000");
    expect(openApi.request).toHaveBeenCalledTimes(1);
    expect(openApi.request).toHaveBeenCalledWith({
      url: "/public-settings/supportWhatsAppNumber",
      method: "GET",
      params: { token: "wtV" },
    });
  });
});
