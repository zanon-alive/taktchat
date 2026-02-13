import PartnerSignupService from "../PartnerSignupService";
import Company from "../../../models/Company";
import User from "../../../models/User";
import Plan from "../../../models/Plan";
import CompanyAccessService from "../CompanyAccessService";
import CreateCompanyService from "../CreateCompanyService";
import CreateLicenseService from "../../LicenseService/CreateLicenseService";

jest.mock("../../../models/Company");
jest.mock("../../../models/User");
jest.mock("../../../models/Plan");
jest.mock("../CompanyAccessService");
jest.mock("../CreateCompanyService");
jest.mock("../../LicenseService/CreateLicenseService");

describe("PartnerSignupService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve criar empresa, usuário e licença quando dados são válidos", async () => {
    const partner = {
      id: 1,
      type: "whitelabel",
      name: "Parceiro Teste",
      trialDaysForChildCompanies: 7
    };

    const plan = {
      id: 1,
      companyId: 1,
      name: "Plano Teste",
      targetType: "whitelabel"
    };

    (Company.findByPk as jest.Mock).mockResolvedValue(partner);
    (CompanyAccessService as jest.Mock).mockResolvedValue({ allowed: true });
    (Plan.findByPk as jest.Mock).mockResolvedValue(plan);
    (User.findOne as jest.Mock).mockResolvedValue(null);
    (CreateCompanyService as jest.Mock).mockResolvedValue({
      id: 2,
      name: "Empresa Filha"
    });
    (CreateLicenseService as jest.Mock).mockResolvedValue({
      id: 1,
      companyId: 2,
      status: "active"
    });

    const result = await PartnerSignupService({
      partnerId: 1,
      companyName: "Empresa Filha",
      adminName: "Admin",
      email: "admin@teste.com",
      password: "senha123",
      planId: 1
    });

    expect(result.company).toBeDefined();
    expect(result.message).toContain("7 dias");
    expect(CreateCompanyService).toHaveBeenCalled();
    expect(CreateLicenseService).toHaveBeenCalled();
  });

  it("deve rejeitar quando parceiro não é whitelabel", async () => {
    (Company.findByPk as jest.Mock).mockResolvedValue({
      id: 1,
      type: "direct"
    });

    await expect(
      PartnerSignupService({
        partnerId: 1,
        companyName: "Empresa",
        adminName: "Admin",
        email: "admin@teste.com",
        password: "senha123",
        planId: 1
      })
    ).rejects.toThrow("Parceiro inválido");
  });

  it("deve rejeitar quando e-mail já existe", async () => {
    (Company.findByPk as jest.Mock).mockResolvedValue({
      id: 1,
      type: "whitelabel",
      trialDaysForChildCompanies: 7
    });
    (CompanyAccessService as jest.Mock).mockResolvedValue({ allowed: true });
    (Plan.findByPk as jest.Mock).mockResolvedValue({
      id: 1,
      companyId: 1,
      targetType: "whitelabel"
    });
    (User.findOne as jest.Mock).mockResolvedValue({
      id: 1,
      email: "admin@teste.com"
    });

    await expect(
      PartnerSignupService({
        partnerId: 1,
        companyName: "Empresa",
        adminName: "Admin",
        email: "admin@teste.com",
        password: "senha123",
        planId: 1
      })
    ).rejects.toThrow("E-mail já cadastrado");
  });
});
