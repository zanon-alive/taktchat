jest.mock("../../../models/Company", () => ({
  __esModule: true,
  default: { findByPk: jest.fn() }
}));
jest.mock("../../../models/User", () => ({
  __esModule: true,
  default: { findOne: jest.fn() }
}));
jest.mock("../../../models/Plan", () => ({
  __esModule: true,
  default: { findByPk: jest.fn() }
}));
jest.mock("../../../models/CompaniesSettings", () => ({
  __esModule: true,
  default: { findOne: jest.fn() }
}));
jest.mock("../CreateCompanyService", () => ({
  __esModule: true,
  default: jest.fn()
}));
jest.mock("../../LicenseService/CreateLicenseService", () => ({
  __esModule: true,
  default: jest.fn()
}));
jest.mock("../../InvoicesService/EnsureOpenInvoiceForCompanyService", () => ({
  __esModule: true,
  default: jest.fn(() => Promise.resolve({ id: 1 }))
}));
jest.mock("../../MailServices/SendWelcomePartnerSignupMailService", () => ({
  sendWelcomePartnerSignupMail: jest.fn(() => Promise.resolve())
}));
jest.mock("../../../config/platform", () => ({
  getPlatformCompanyId: jest.fn(() => 1)
}));

import DirectSignupService from "../DirectSignupService";
import CompaniesSettings from "../../../models/CompaniesSettings";
import Plan from "../../../models/Plan";
import User from "../../../models/User";
import CreateCompanyService from "../CreateCompanyService";
import CreateLicenseService from "../../LicenseService/CreateLicenseService";
import EnsureOpenInvoiceForCompanyService from "../../InvoicesService/EnsureOpenInvoiceForCompanyService";

describe("DirectSignupService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("grava dueDate do trial e abre fatura", async () => {
    (CompaniesSettings.findOne as jest.Mock).mockResolvedValue({
      enableLandingSignup: true
    });
    (Plan.findByPk as jest.Mock).mockResolvedValue({
      id: 4,
      companyId: 1,
      targetType: "direct",
      recurrence: "MENSAL"
    });
    (User.findOne as jest.Mock).mockResolvedValue(null);
    (CreateCompanyService as jest.Mock).mockResolvedValue({
      id: 10,
      name: "Nova Co"
    });
    (CreateLicenseService as jest.Mock).mockResolvedValue({ id: 1 });

    const result = await DirectSignupService({
      companyName: "Nova Co",
      adminName: "Ana",
      email: "ana@teste.com",
      password: "senha123",
      planId: 4
    });

    expect(result.message).toContain("14 dias");
    expect(CreateCompanyService).toHaveBeenCalledWith(
      expect.objectContaining({
        dueDate: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
        recurrence: "MENSAL",
        licenseStartDate: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
        licenseEndDate: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/)
      })
    );
    expect(CreateLicenseService).not.toHaveBeenCalled();
    expect(EnsureOpenInvoiceForCompanyService).toHaveBeenCalledWith(
      10,
      expect.any(Date)
    );
  });
});
