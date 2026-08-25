import { resolvePartnerFromTokenOrId } from "../PartnerSignupToken";
import Company from "../../models/Company";

jest.mock("../../models/Company", () => ({
  __esModule: true,
  default: {
    findOne: jest.fn()
  }
}));

describe("resolvePartnerFromTokenOrId", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("resolve pelo signupToken mesmo quando o hex começa com dígito", async () => {
    (Company.findOne as jest.Mock).mockResolvedValueOnce({ id: 4 });

    const result = await resolvePartnerFromTokenOrId("9abcdef012345678");

    expect(result).toEqual({ partnerId: 4 });
    expect(Company.findOne).toHaveBeenCalledTimes(1);
    expect(Company.findOne).toHaveBeenCalledWith({
      where: { signupToken: "9abcdef012345678", type: "whitelabel" },
      attributes: ["id"]
    });
  });

  it("usa companyId só quando a string inteira é dígitos e não há token", async () => {
    (Company.findOne as jest.Mock)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ id: 4 });

    const result = await resolvePartnerFromTokenOrId("4");

    expect(result).toEqual({ partnerId: 4 });
    expect(Company.findOne).toHaveBeenNthCalledWith(2, {
      where: { id: 4, type: "whitelabel" },
      attributes: ["id"]
    });
  });

  it("não trata hex alfanumérico como companyId", async () => {
    (Company.findOne as jest.Mock).mockResolvedValueOnce(null);

    const result = await resolvePartnerFromTokenOrId("4abc");

    expect(result).toBeNull();
    expect(Company.findOne).toHaveBeenCalledTimes(1);
  });
});
