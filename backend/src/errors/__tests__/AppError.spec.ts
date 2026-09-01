import AppError, { toHttpStatusCode } from "../AppError";

describe("toHttpStatusCode", () => {
  it("aceita status HTTP inteiro", () => {
    expect(toHttpStatusCode(404)).toBe(404);
    expect(toHttpStatusCode("401")).toBe(401);
  });

  it("usa fallback quando o valor não é status HTTP", () => {
    expect(toHttpStatusCode({ name: "SequelizeUniqueConstraintError" })).toBe(400);
    expect(toHttpStatusCode("abc")).toBe(400);
    expect(toHttpStatusCode(99)).toBe(400);
    expect(toHttpStatusCode(600)).toBe(400);
  });
});

describe("AppError", () => {
  it("não grava objeto Sequelize como statusCode", () => {
    const err = new AppError("Não foi possível criar a empresa!", {
      name: "SequelizeUniqueConstraintError"
    } as unknown as number);

    expect(err.message).toBe("Não foi possível criar a empresa!");
    expect(err.statusCode).toBe(400);
  });
});
