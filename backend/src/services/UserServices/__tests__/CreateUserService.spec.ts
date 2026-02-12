jest.mock("../../../models/User", () => ({
  __esModule: true,
  default: {
    findOne: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
  },
}));

jest.mock("../../../models/Company", () => ({
  __esModule: true,
  default: {
    findOne: jest.fn(),
  },
}));

jest.mock("../../../models/Plan", () => ({
  __esModule: true,
  default: {},
}));

jest.mock("../../../helpers/SerializeUser", () => ({
  SerializeUser: jest.fn((user: { id: number; name: string; email: string; profile: string }) =>
    Promise.resolve({
      id: user.id,
      name: user.name,
      email: user.email,
      profile: user.profile,
    })
  ),
}));

import CreateUserService from "../CreateUserService";
import User from "../../../models/User";
import Company from "../../../models/Company";
import AppError from "../../../errors/AppError";

describe("CreateUserService - regras de super (Dono da Plataforma)", () => {
  const platformCompanyId = 1;
  const envRestore: { key: string; value: string | undefined }[] = [];

  const mockUser = {
    id: 1,
    email: "admin@test.com",
    name: "Admin",
    profile: "admin",
    companyId: platformCompanyId,
    super: true,
    set: jest.fn(),
    reload: jest.fn(),
    $set: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(() => {
    envRestore.length = 0;
    const key = "PLATFORM_COMPANY_ID";
    envRestore.push({ key, value: process.env[key] });
    process.env[key] = String(platformCompanyId);
    (User.findOne as jest.Mock).mockResolvedValue(null);
    (User.count as jest.Mock).mockResolvedValue(0);
    (User.create as jest.Mock).mockResolvedValue({
      ...mockUser,
      reload: jest.fn().mockResolvedValue(mockUser),
    });
    (Company.findOne as jest.Mock).mockResolvedValue({
      id: platformCompanyId,
      plan: { users: 10 },
    });
  });

  afterEach(() => {
    envRestore.forEach(({ key, value }) => {
      if (value !== undefined) process.env[key] = value;
      else delete process.env[key];
    });
  });

  it("não deve criar usuário quando super=true e companyId não é da empresa plataforma", async () => {
    process.env.PLATFORM_COMPANY_ID = "1";
    const nonPlatformCompanyId = 2;

    try {
      await CreateUserService({
        email: "admin@empresa2.com",
        password: "123456",
        name: "Admin Empresa 2",
        companyId: nonPlatformCompanyId,
        profile: "admin",
        super: true,
      });
    } catch {
      // esperado: AppError
    }

    // Se a validação de super estiver ativa, User.create não deve ser chamado
    expect(User.create).not.toHaveBeenCalled();
  });

  it("deve permitir criar usuário com super=true quando companyId é da empresa plataforma", async () => {
    (User.create as jest.Mock).mockResolvedValue({
      ...mockUser,
      reload: jest.fn().mockResolvedValue(mockUser),
      $set: jest.fn().mockResolvedValue(undefined),
    });

    const result = await CreateUserService({
      email: "super@plataforma.com",
      password: "123456",
      name: "Dono Plataforma",
      companyId: platformCompanyId,
      profile: "admin",
      super: true,
    });

    expect(User.create).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "super@plataforma.com",
        name: "Dono Plataforma",
        companyId: platformCompanyId,
        super: true,
      }),
      expect.anything()
    );
    expect(result).toBeDefined();
  });

  it("deve permitir criar usuário com super=false em qualquer empresa", async () => {
    (User.create as jest.Mock).mockResolvedValue({
      ...mockUser,
      super: false,
      companyId: 2,
      reload: jest.fn().mockResolvedValue({ ...mockUser, super: false, companyId: 2 }),
      $set: jest.fn().mockResolvedValue(undefined),
    });

    await CreateUserService({
      email: "user@empresa2.com",
      password: "123456",
      name: "User Empresa 2",
      companyId: 2,
      profile: "admin",
      super: false,
    });

    expect(User.create).toHaveBeenCalledWith(
      expect.objectContaining({
        companyId: 2,
        super: false,
      }),
      expect.anything()
    );
  });
});
