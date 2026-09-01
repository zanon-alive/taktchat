import AppError from "../../errors/AppError";
import {
  isIdUniqueConstraintError,
  mapCompanyCreateError
} from "../mapCompanyCreateError";

jest.mock("../../utils/logger", () => ({
  __esModule: true,
  default: { error: jest.fn(), warn: jest.fn() }
}));

const uniqueError = (path: string, fields: Record<string, unknown> = {}) => ({
  name: "SequelizeUniqueConstraintError",
  errors: [{ path }],
  fields,
  parent: { constraint: "" }
});

describe("mapCompanyCreateError", () => {
  it("repassa AppError existente", () => {
    const original = new AppError("E-mail já cadastrado.", 400);
    expect(mapCompanyCreateError(original)).toBe(original);
  });

  it("mapeia unique de e-mail", () => {
    const mapped = mapCompanyCreateError(uniqueError("email", { email: "a@b.com" }));
    expect(mapped).toBeInstanceOf(AppError);
    expect(mapped.statusCode).toBe(400);
    expect(mapped.message).toBe("E-mail já cadastrado.");
  });

  it("mapeia unique de nome", () => {
    const mapped = mapCompanyCreateError(uniqueError("name", { name: "ACME" }));
    expect(mapped.message).toBe("Já existe uma empresa com este nome.");
    expect(mapped.statusCode).toBe(400);
  });

  it("mapeia unique de id sem vazar o erro Sequelize como status", () => {
    const mapped = mapCompanyCreateError(uniqueError("id", { id: "1" }));
    expect(mapped.statusCode).toBe(400);
    expect(typeof mapped.statusCode).toBe("number");
    expect(mapped.message).toBe("Não foi possível criar a empresa. Tente novamente.");
  });

  it("identifica unique de id", () => {
    expect(isIdUniqueConstraintError(uniqueError("id", { id: "1" }))).toBe(true);
    expect(isIdUniqueConstraintError(uniqueError("email"))).toBe(false);
    expect(isIdUniqueConstraintError(new Error("fail"))).toBe(false);
  });
});
