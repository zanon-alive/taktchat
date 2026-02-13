import CompanyAccessService, { CompanyAccessResult } from "../CompanyAccessService";
import Company from "../../../models/Company";
import License from "../../../models/License";
import { getPlatformCompanyId } from "../../../config/platform";

// Mock dos models
jest.mock("../../../models/Company");
jest.mock("../../../models/License");
jest.mock("../../../config/platform", () => ({
  getPlatformCompanyId: jest.fn(() => 1)
}));

describe("CompanyAccessService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Empresa plataforma", () => {
    it("deve sempre permitir acesso para empresa plataforma", async () => {
      const platformId = getPlatformCompanyId();
      const result = await CompanyAccessService(platformId);
      expect(result.allowed).toBe(true);
      expect(result.reason).toBeUndefined();
    });
  });

  describe("Empresa whitelabel", () => {
    it("deve permitir acesso quando tem licença ativa com endDate válida", async () => {
      const today = new Date();
      const endDate = new Date(today);
      endDate.setUTCDate(endDate.getUTCDate() + 30);

      (Company.findByPk as jest.Mock).mockResolvedValue({
        id: 2,
        type: "whitelabel",
        parentCompanyId: null,
        accessBlockedByParent: false
      });

      (License.findAll as jest.Mock).mockResolvedValue([
        {
          id: 1,
          companyId: 2,
          status: "active",
          endDate
        }
      ]);

      const result = await CompanyAccessService(2);
      expect(result.allowed).toBe(true);
    });

    it("deve negar acesso quando licença está vencida", async () => {
      const today = new Date();
      const endDate = new Date(today);
      endDate.setUTCDate(endDate.getUTCDate() - 1);

      (Company.findByPk as jest.Mock).mockResolvedValue({
        id: 2,
        type: "whitelabel",
        parentCompanyId: null,
        accessBlockedByParent: false
      });

      (License.findAll as jest.Mock).mockResolvedValue([
        {
          id: 1,
          companyId: 2,
          status: "active",
          endDate
        }
      ]);

      const result = await CompanyAccessService(2);
      expect(result.allowed).toBe(false);
      expect(result.code).toBe("ERR_ACCESS_BLOCKED_PLATFORM");
    });

    it("deve considerar a licença com maior endDate quando há múltiplas licenças", async () => {
      const today = new Date();
      const endDate1 = new Date(today);
      endDate1.setUTCDate(endDate1.getUTCDate() + 10);
      const endDate2 = new Date(today);
      endDate2.setUTCDate(endDate2.getUTCDate() + 30);

      (Company.findByPk as jest.Mock).mockResolvedValue({
        id: 2,
        type: "whitelabel",
        parentCompanyId: null,
        accessBlockedByParent: false
      });

      (License.findAll as jest.Mock).mockResolvedValue([
        {
          id: 1,
          companyId: 2,
          status: "active",
          endDate: endDate1
        },
        {
          id: 2,
          companyId: 2,
          status: "active",
          endDate: endDate2
        }
      ]);

      const result = await CompanyAccessService(2);
      expect(result.allowed).toBe(true);
    });
  });

  describe("Empresa direct", () => {
    it("deve negar acesso quando bloqueada pelo parceiro", async () => {
      (Company.findByPk as jest.Mock).mockResolvedValue({
        id: 3,
        type: "direct",
        parentCompanyId: 2,
        accessBlockedByParent: true
      });

      const result = await CompanyAccessService(3);
      expect(result.allowed).toBe(false);
      expect(result.code).toBe("ERR_ACCESS_BLOCKED_PARTNER");
    });

    it("deve negar acesso quando parceiro está bloqueado pela plataforma", async () => {
      (Company.findByPk as jest.Mock)
        .mockResolvedValueOnce({
          id: 3,
          type: "direct",
          parentCompanyId: 2,
          accessBlockedByParent: false
        })
        .mockResolvedValueOnce({
          id: 2,
          type: "whitelabel",
          parentCompanyId: null,
          accessBlockedByParent: false
        });

      const today = new Date();
      const endDate = new Date(today);
      endDate.setUTCDate(endDate.getUTCDate() - 1);

      (License.findAll as jest.Mock)
        .mockResolvedValueOnce([]) // Parceiro sem licença válida
        .mockResolvedValueOnce([
          {
            id: 1,
            companyId: 3,
            status: "active",
            endDate: new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)
          }
        ]);

      const result = await CompanyAccessService(3);
      expect(result.allowed).toBe(false);
      expect(result.code).toBe("ERR_ACCESS_BLOCKED_PLATFORM");
    });
  });
});
