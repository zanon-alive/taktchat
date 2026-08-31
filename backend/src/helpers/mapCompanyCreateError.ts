import AppError from "../errors/AppError";
import logger from "../utils/logger";

type UniqueLike = {
  name?: string;
  errors?: Array<{ path?: string }>;
  fields?: Record<string, unknown>;
  parent?: { constraint?: string };
};

const isUniqueConstraintError = (error: unknown): error is UniqueLike => {
  return (
    typeof error === "object" &&
    error !== null &&
    (error as UniqueLike).name === "SequelizeUniqueConstraintError"
  );
};

const uniquePath = (error: UniqueLike): string => {
  const fromErrors = error.errors?.[0]?.path;
  if (fromErrors) return String(fromErrors);
  const fields = Object.keys(error.fields || {});
  return fields[0] || "";
};

const uniqueConstraint = (error: UniqueLike): string => {
  return error.parent?.constraint || "";
};

export const isIdUniqueConstraintError = (error: unknown): boolean => {
  if (!isUniqueConstraintError(error)) return false;
  const path = uniquePath(error);
  return path === "id" || error.fields?.id != null;
};

export const mapCompanyCreateError = (error: unknown): AppError => {
  if (error instanceof AppError) {
    return error;
  }

  if (isUniqueConstraintError(error)) {
    const path = uniquePath(error);
    const constraint = uniqueConstraint(error);

    if (path === "email" || /email/i.test(constraint)) {
      return new AppError("E-mail já cadastrado.", 400);
    }
    if (path === "name" || /Companies_name/i.test(constraint)) {
      return new AppError("Já existe uma empresa com este nome.", 400);
    }
    if (path === "id") {
      return new AppError(
        "Não foi possível criar a empresa. Tente novamente.",
        400
      );
    }
    return new AppError("Não foi possível criar a empresa: registro duplicado.", 400);
  }

  logger.error({ err: error }, "Falha ao criar empresa");
  return new AppError("Não foi possível criar a empresa.", 400);
};
