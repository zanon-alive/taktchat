jest.mock("../ShowUserService", () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock("../../../models/User", () => ({
  __esModule: true,
  default: {},
}));

jest.mock("../../../models/Company", () => ({
  __esModule: true,
  default: {
    findByPk: jest.fn(),
  },
}));

import UpdateUserService from "../UpdateUserService";
import ShowUserService from "../ShowUserService";
import Company from "../../../models/Company";
import AppError from "../../../errors/AppError";

describe("UpdateUserService - regras de super (Dono da Plataforma)", () => {
  const platformCompanyId = 1;

  beforeEach(() => {
    process.env.PLATFORM_COMPANY_ID = String(platformCompanyId);
    jest.clearAllMocks();
    (Company.findByPk as jest.Mock).mockResolvedValue({
      id: 1,
      email: "company@test.com",
      update: jest.fn().mockResolvedValue(undefined),
    });
  });

  it("não deve atualizar usuário para super=true quando user.companyId não é da empresa plataforma", async () => {
    process.env.PLATFORM_COMPANY_ID = "1";
    const userNonPlatform = {
      id: 10,
      name: "Admin",
      email: "admin@empresa2.com",
      profile: "admin",
      companyId: 2,
      super: false,
      update: jest.fn().mockResolvedValue(undefined),
      reload: jest.fn().mockResolvedValue(undefined),
      $set: jest.fn().mockResolvedValue(undefined),
      queues: [],
      company: { id: 2 },
      startWork: null,
      endWork: null,
      farewellMessage: null,
      allTicket: null,
      defaultTheme: null,
      defaultMenu: null,
      allowGroup: null,
      allHistoric: null,
      allUserChat: null,
      userClosePendingTicket: null,
      showDashboard: null,
      defaultTicketsManagerWidth: 550,
      allowRealTime: null,
      allowConnections: null,
      profileImage: null,
      allowedContactTags: [],
      permissions: [],
    };
    (ShowUserService as jest.Mock).mockResolvedValue(userNonPlatform);

    try {
      await UpdateUserService({
        userData: { super: true },
        userId: 10,
        companyId: 2,
        requestUserId: 1,
      });
    } catch {
      // esperado: AppError
    }

    expect(userNonPlatform.update).not.toHaveBeenCalled();
  });

  it("deve permitir promover usuário a super=true quando user.companyId é da empresa plataforma", async () => {
    const userPlatform = {
      id: 1,
      name: "Dono",
      email: "dono@plataforma.com",
      profile: "admin",
      companyId: platformCompanyId,
      super: false,
      update: jest.fn().mockResolvedValue(undefined),
      reload: jest.fn().mockResolvedValue(undefined),
      $set: jest.fn().mockResolvedValue(undefined),
      queues: [],
      company: { id: platformCompanyId },
      startWork: null,
      endWork: null,
      farewellMessage: null,
      allTicket: null,
      defaultTheme: null,
      defaultMenu: null,
      allowGroup: null,
      allHistoric: null,
      allUserChat: null,
      userClosePendingTicket: null,
      showDashboard: null,
      defaultTicketsManagerWidth: 550,
      allowRealTime: null,
      allowConnections: null,
      profileImage: null,
      allowedContactTags: [],
      permissions: [],
    };
    (ShowUserService as jest.Mock).mockResolvedValue(userPlatform);
    userPlatform.reload = jest.fn().mockResolvedValue({ ...userPlatform, super: true });

    const result = await UpdateUserService({
      userData: { super: true },
      userId: 1,
      companyId: platformCompanyId,
      requestUserId: 1,
    });

    expect(userPlatform.update).toHaveBeenCalledWith(expect.objectContaining({ super: true }));
    expect(result).toBeDefined();
  });

  it("deve permitir atualizar super=false para qualquer usuário (remover super)", async () => {
    const userNonPlatform = {
      id: 10,
      name: "Admin",
      email: "admin@empresa2.com",
      profile: "admin",
      companyId: 2,
      super: true,
      update: jest.fn().mockResolvedValue(undefined),
      reload: jest.fn().mockResolvedValue(undefined),
      $set: jest.fn().mockResolvedValue(undefined),
      queues: [],
      company: { id: 2, email: "c@test.com", update: jest.fn().mockResolvedValue(undefined) },
      startWork: null,
      endWork: null,
      farewellMessage: null,
      allTicket: null,
      defaultTheme: null,
      defaultMenu: null,
      allowGroup: null,
      allHistoric: null,
      allUserChat: null,
      userClosePendingTicket: null,
      showDashboard: null,
      defaultTicketsManagerWidth: 550,
      allowRealTime: null,
      allowConnections: null,
      profileImage: null,
      allowedContactTags: [],
      permissions: [],
    };
    (ShowUserService as jest.Mock).mockResolvedValue(userNonPlatform);
    userNonPlatform.reload = jest.fn().mockResolvedValue({ ...userNonPlatform, super: false });

    await UpdateUserService({
      userData: { super: false },
      userId: 10,
      companyId: 2,
      requestUserId: 1,
    });

    expect(userNonPlatform.update).toHaveBeenCalledWith(expect.objectContaining({ super: false }));
  });
});
