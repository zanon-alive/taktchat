import sequelize from "../../../database";
import FindCompanySettingOneService from "../FindCompanySettingOneService";
import EnsureCompanySettingsService from "../EnsureCompanySettingsService";
import CompaniesSettings from "../../../models/CompaniesSettings";

jest.mock("../../../database", () => ({
  __esModule: true,
  default: { query: jest.fn() }
}));

jest.mock("../../../models/CompaniesSettings", () => ({
  __esModule: true,
  default: {
    findOrCreate: jest.fn()
  }
}));

describe("FindCompanySettingOneService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("usa bind de companyId e não concatena o id no SQL", async () => {
    (sequelize.query as jest.Mock).mockResolvedValue([[{ showNotificationPending: false }]]);

    const result = await FindCompanySettingOneService({
      companyId: 1,
      column: "showNotificationPending"
    });

    expect(result).toEqual([{ showNotificationPending: false }]);
    expect(sequelize.query).toHaveBeenCalledWith(
      'SELECT "showNotificationPending" FROM "CompaniesSettings" WHERE "companyId" = :companyId',
      { replacements: { companyId: 1 } }
    );
  });

  it("retorna array vazio quando a coluna não está na allowlist", async () => {
    const result = await FindCompanySettingOneService({
      companyId: 1,
      column: "drop table"
    });

    expect(result).toEqual([]);
    expect(sequelize.query).not.toHaveBeenCalled();
  });
});

describe("EnsureCompanySettingsService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("sinaliza created quando a linha não existia", async () => {
    (CompaniesSettings.findOrCreate as jest.Mock).mockResolvedValue([
      { companyId: 1 },
      true
    ]);

    const result = await EnsureCompanySettingsService({ companyId: 1 });

    expect(result.created).toBe(true);
    expect(CompaniesSettings.findOrCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { companyId: 1 },
        defaults: expect.objectContaining({
          companyId: 1,
          showNotificationPending: false
        })
      })
    );
  });

  it("sinaliza created false quando a linha já existe", async () => {
    (CompaniesSettings.findOrCreate as jest.Mock).mockResolvedValue([
      { companyId: 1 },
      false
    ]);

    const result = await EnsureCompanySettingsService({ companyId: 1 });

    expect(result.created).toBe(false);
  });
});
