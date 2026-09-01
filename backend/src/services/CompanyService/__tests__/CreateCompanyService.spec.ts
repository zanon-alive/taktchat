jest.mock("../../../database", () => ({
  __esModule: true,
  default: {
    transaction: jest.fn(),
    query: jest.fn()
  }
}));
jest.mock("../../../models/Company", () => ({
  __esModule: true,
  default: { findOne: jest.fn(), findByPk: jest.fn(), create: jest.fn() }
}));
jest.mock("../../../models/User", () => ({
  __esModule: true,
  default: { findOne: jest.fn(), create: jest.fn() }
}));
jest.mock("../../../models/CompaniesSettings", () => ({
  __esModule: true,
  default: { create: jest.fn() }
}));
jest.mock("../../../models/Plan", () => ({
  __esModule: true,
  default: { findByPk: jest.fn() }
}));
jest.mock("../../../models/Queue", () => ({
  __esModule: true,
  default: { create: jest.fn() }
}));
jest.mock("../../../models/UserQueue", () => ({
  __esModule: true,
  default: { create: jest.fn() }
}));
jest.mock("../../CompaniesSettings/EnsureCompanySettingsService", () => ({
  getCompanySettingsDefaults: jest.fn((companyId: number) => ({ companyId }))
}));
jest.mock("../../../config/platform", () => ({
  getPlatformCompanyId: jest.fn(() => 1),
  isPlatformCompany: jest.fn((id: number) => id === 1)
}));
jest.mock("../../LicenseService/CreateLicenseService", () => ({
  __esModule: true,
  default: jest.fn()
}));
jest.mock("../../../helpers/PartnerSignupToken", () => ({
  generateSignupToken: jest.fn(() => "token")
}));
jest.mock("../../../helpers/syncSerialSequence", () => ({
  syncCompanyCreateSequences: jest.fn()
}));
jest.mock("../../../utils/logger", () => ({
  __esModule: true,
  default: { error: jest.fn(), warn: jest.fn() }
}));

import CreateCompanyService from "../CreateCompanyService";
import Company from "../../../models/Company";
import User from "../../../models/User";
import CompaniesSettings from "../../../models/CompaniesSettings";
import sequelize from "../../../database";
import { syncCompanyCreateSequences } from "../../../helpers/syncSerialSequence";

describe("CreateCompanyService", () => {
  const transaction = { commit: jest.fn(), rollback: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
    (sequelize.transaction as jest.Mock).mockResolvedValue(transaction);
    (Company.findOne as jest.Mock).mockResolvedValue(null);
    (User.findOne as jest.Mock).mockResolvedValue(null);
    (CompaniesSettings.create as jest.Mock).mockResolvedValue({ id: 2 });
  });

  it("rejeita nome de empresa já existente com 400", async () => {
    (Company.findOne as jest.Mock).mockResolvedValue({ id: 1, name: "ACME" });

    await expect(
      CreateCompanyService({ name: "ACME", email: "a@b.com", password: "senha123" })
    ).rejects.toMatchObject({ message: "Já existe uma empresa com este nome.", statusCode: 400 });

    expect(Company.create).not.toHaveBeenCalled();
  });

  it("rejeita e-mail já cadastrado com 400", async () => {
    (User.findOne as jest.Mock).mockResolvedValue({ id: 1, email: "a@b.com" });

    await expect(
      CreateCompanyService({ name: "Nova", email: "a@b.com", password: "senha123" })
    ).rejects.toMatchObject({ message: "E-mail já cadastrado.", statusCode: 400 });

    expect(Company.create).not.toHaveBeenCalled();
  });

  it("em unique de id alinha sequences e lança AppError 400 (não 500)", async () => {
    const uniqueId = {
      name: "SequelizeUniqueConstraintError",
      errors: [{ path: "id" }],
      fields: { id: "1" }
    };
    (Company.create as jest.Mock).mockRejectedValue(uniqueId);

    await expect(
      CreateCompanyService({ name: "Nova Co", email: "nova@co.com", password: "senha123" })
    ).rejects.toEqual(
      expect.objectContaining({
        message: "Não foi possível criar a empresa. Tente novamente.",
        statusCode: 400
      })
    );

    expect(transaction.rollback).toHaveBeenCalled();
    expect(syncCompanyCreateSequences).toHaveBeenCalled();
  });

  it("cria empresa, usuário e settings no caminho feliz", async () => {
    (Company.create as jest.Mock).mockResolvedValue({
      id: 2,
      name: "Nova Co",
      email: "nova@co.com"
    });
    (User.create as jest.Mock).mockResolvedValue({ id: 2 });

    const company = await CreateCompanyService({
      name: "Nova Co",
      email: "nova@co.com",
      password: "senha123",
      requestUserCompanyId: 1,
      requestUserSuper: true
    });

    expect(company.id).toBe(2);
    expect(transaction.commit).toHaveBeenCalled();
    expect(User.create).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "nova@co.com",
        profile: "admin",
        companyId: 2
      }),
      expect.anything()
    );
  });
});
