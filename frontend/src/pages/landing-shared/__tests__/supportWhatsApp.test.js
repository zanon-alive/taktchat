import { getNumberSupport } from "../../../config";
import {
  SUPPORT_WHATSAPP_FALLBACK,
  SUPPORT_WHATSAPP_INTEREST_TEXT,
  getSupportWhatsAppUrl,
} from "../supportWhatsApp";

jest.mock("../../../config", () => ({
  getNumberSupport: jest.fn(),
}));

describe("supportWhatsApp", () => {
  it("usa o número cadastrado e a mensagem de interesse", () => {
    getNumberSupport.mockReturnValue("55 14 99999-0000");
    expect(getSupportWhatsAppUrl()).toBe(
      `https://wa.me/5514999990000?text=${encodeURIComponent(SUPPORT_WHATSAPP_INTEREST_TEXT)}`
    );
  });

  it("cai no fallback se não houver número", () => {
    getNumberSupport.mockReturnValue("");
    expect(getSupportWhatsAppUrl()).toContain(`wa.me/${SUPPORT_WHATSAPP_FALLBACK}`);
    expect(getSupportWhatsAppUrl()).toContain(encodeURIComponent(SUPPORT_WHATSAPP_INTEREST_TEXT));
  });
});
