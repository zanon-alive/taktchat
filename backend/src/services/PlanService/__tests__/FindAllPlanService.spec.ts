jest.mock("../../../config/platform", () => ({
  getPlatformCompanyId: jest.fn(() => 1),
}));

jest.mock("../../../models/Plan", () => ({
  __esModule: true,
  default: {
    findAll: jest.fn(),
  },
}));

import Plan from "../../../models/Plan";
import { getPlatformCompanyId } from "../../../config/platform";
import FindAllPlanService from "../FindAllPlanService";

describe("FindAllPlanService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getPlatformCompanyId as jest.Mock).mockReturnValue(1);
  });

  describe("listPublic === 'false' (landing page)", () => {
    it("deve retornar apenas planos públicos da empresa plataforma com targetType direct", async () => {
      const mockDirectPlans = [
        {
          id: 1,
          name: "Básico",
          isPublic: true,
          companyId: 1,
          targetType: "direct",
        },
        {
          id: 2,
          name: "Premium",
          isPublic: true,
          companyId: 1,
          targetType: "direct",
        },
      ];
      (Plan.findAll as jest.Mock).mockResolvedValue(mockDirectPlans);

      const result = await FindAllPlanService("false");

      expect(getPlatformCompanyId).toHaveBeenCalled();
      expect(Plan.findAll).toHaveBeenCalledTimes(1);
      expect(Plan.findAll).toHaveBeenCalledWith({
        where: {
          isPublic: true,
          companyId: 1,
          targetType: "direct",
        },
        order: [["name", "ASC"]],
      });
      expect(result).toEqual(mockDirectPlans);
      expect(result).toHaveLength(2);
    });

    it("não deve incluir planos whitelabel (filtro por targetType direct)", async () => {
      const mockDirectPlans = [
        {
          id: 1,
          name: "Básico",
          isPublic: true,
          companyId: 1,
          targetType: "direct",
        },
      ];
      (Plan.findAll as jest.Mock).mockResolvedValue(mockDirectPlans);

      await FindAllPlanService("false");

      const where = (Plan.findAll as jest.Mock).mock.calls[0][0].where;
      expect(where.targetType).toBe("direct");
      expect(where.companyId).toBe(1);
      expect(where.isPublic).toBe(true);
    });

    it("deve usar platformCompanyId retornado por getPlatformCompanyId", async () => {
      (getPlatformCompanyId as jest.Mock).mockReturnValue(5);
      (Plan.findAll as jest.Mock).mockResolvedValue([]);

      await FindAllPlanService("false");

      expect(Plan.findAll).toHaveBeenCalledWith({
        where: {
          isPublic: true,
          companyId: 5,
          targetType: "direct",
        },
        order: [["name", "ASC"]],
      });
    });
  });

  describe("listPublic !== 'false' (listagem interna)", () => {
    it("deve retornar todos os planos sem filtro de companyId/targetType", async () => {
      const mockAllPlans = [
        { id: 1, name: "Básico", targetType: "direct", companyId: 1 },
        { id: 2, name: "Whitelabel Básico", targetType: "whitelabel", companyId: 1 },
      ];
      (Plan.findAll as jest.Mock).mockResolvedValue(mockAllPlans);

      const result = await FindAllPlanService("true");

      expect(Plan.findAll).toHaveBeenCalledWith({
        order: [["name", "ASC"]],
      });
      expect(Plan.findAll).not.toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.anything(),
        })
      );
      expect(result).toHaveLength(2);
    });

    it("deve retornar todos os planos quando listPublic é undefined", async () => {
      (Plan.findAll as jest.Mock).mockResolvedValue([]);

      await FindAllPlanService(undefined);

      expect(Plan.findAll).toHaveBeenCalledWith({
        order: [["name", "ASC"]],
      });
      expect(getPlatformCompanyId).not.toHaveBeenCalled();
    });
  });
});
