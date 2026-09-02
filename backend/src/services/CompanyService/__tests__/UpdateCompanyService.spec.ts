jest.mock("../../../database", () => ({
  __esModule: true,
  default: {
    transaction: jest.fn()
  }
}));
jest.mock("../../../models/Company", () => ({
  __esModule: true,
  default: { findByPk: jest.fn() }
}));
jest.mock("../../../models/User", () => ({
  __esModule: true,
  default: { findOne: jest.fn() }
}));
jest.mock("../../../models/Setting", () => ({
  __esModule: true,
  default: { findOrCreate: jest.fn() }
}));
jest.mock("../../../models/License", () => ({
  __esModule: true,
  default: { findAll: jest.fn() }
}));
jest.mock("../../../config/platform", () => ({
  isPlatformCompany: jest.fn((id: number) => id === 1)
}));
jest.mock("../../../helpers/PartnerSignupToken", () => ({
  generateSignupToken: jest.fn(() => "token")
}));
jest.mock("../../LicenseService/CreateLicenseService", () => ({
  __esModule: true,
  default: jest.fn()
}));

import UpdateCompanyService from "../UpdateCompanyService";
import Company from "../../../models/Company";
import User from "../../../models/User";
import License from "../../../models/License";
import sequelize from "../../../database";
import CreateLicenseService from "../../LicenseService/CreateLicenseService";

describe("UpdateCompanyService", () => {
  const transaction = { commit: jest.fn(), rollback: jest.fn() };
  const company = {
    id: 2,
    name: "Gerson",
    email: "gerson@taktchat.com.br",
    type: "direct",
    parentCompanyId: null,
    signupToken: null,
    update: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (sequelize.transaction as jest.Mock).mockResolvedValue(transaction);
    (Company.findByPk as jest.Mock).mockResolvedValue(company);
    (User.findOne as jest.Mock).mockResolvedValue({
      id: 9,
      email: "gerson@taktchat.com.br",
      update: jest.fn()
    });
    (CreateLicenseService as jest.Mock).mockResolvedValue({ id: 1 });
    company.update.mockResolvedValue(company);
  });

  it("cria licença e grava dueDate quando não há vigente", async () => {
    (License.findAll as jest.Mock).mockResolvedValue([]);

    await UpdateCompanyService({
      id: 2,
      name: "Gerson",
      email: "gerson@taktchat.com.br",
      planId: 1,
      licenseStartDate: "2026-09-02",
      licenseEndDate: "2026-10-02",
      requestUserCompanyId: 1,
      requestUserSuper: true
    });

    expect(CreateLicenseService).toHaveBeenCalledWith(
      expect.objectContaining({
        companyId: 2,
        planId: 1,
        status: "active",
        transaction
      })
    );
    expect(company.update).toHaveBeenCalledWith(
      expect.objectContaining({ dueDate: "2026-10-02", planId: 1 }),
      { transaction }
    );
    expect(transaction.commit).toHaveBeenCalled();
  });

  it("ignora campos de licença quando já existe vigente", async () => {
    const endDate = new Date();
    endDate.setUTCDate(endDate.getUTCDate() + 10);
    (License.findAll as jest.Mock).mockResolvedValue([
      { status: "active", endDate }
    ]);

    await UpdateCompanyService({
      id: 2,
      name: "Gerson",
      email: "gerson@taktchat.com.br",
      planId: 99,
      licenseStartDate: "2026-09-02",
      licenseEndDate: "2026-10-02",
      requestUserCompanyId: 1,
      requestUserSuper: true
    });

    expect(CreateLicenseService).not.toHaveBeenCalled();
    expect(sequelize.transaction).not.toHaveBeenCalled();
    expect(company.update).toHaveBeenCalledWith(
      expect.not.objectContaining({ dueDate: "2026-10-02" })
    );
  });

  it("exige plano e datas quando não há licença vigente", async () => {
    (License.findAll as jest.Mock).mockResolvedValue([]);

    await expect(
      UpdateCompanyService({
        id: 2,
        name: "Gerson",
        email: "gerson@taktchat.com.br",
        requestUserCompanyId: 1,
        requestUserSuper: true
      })
    ).rejects.toMatchObject({
      message: "Plano é obrigatório.",
      statusCode: 400
    });

    expect(CreateLicenseService).not.toHaveBeenCalled();
    expect(company.update).not.toHaveBeenCalled();
  });
});
