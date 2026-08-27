import GetPublicSettingService from "../GetPublicSettingService";
import Setting from "../../../models/Setting";

jest.mock("../../../models/Setting", () => ({
  __esModule: true,
  default: {
    findOne: jest.fn()
  }
}));

describe("GetPublicSettingService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("lê a chave pública na empresa 1", async () => {
    (Setting.findOne as jest.Mock).mockResolvedValue({ value: "5514999990000" });

    await expect(
      GetPublicSettingService({ key: "supportWhatsAppNumber" })
    ).resolves.toBe("5514999990000");

    expect(Setting.findOne).toHaveBeenCalledWith({
      where: { companyId: 1, key: "supportWhatsAppNumber" }
    });
  });

  it("não consulta chave que não é pública", async () => {
    await expect(GetPublicSettingService({ key: "userCreation" })).resolves.toBeNull();
    expect(Setting.findOne).not.toHaveBeenCalled();
  });
});
