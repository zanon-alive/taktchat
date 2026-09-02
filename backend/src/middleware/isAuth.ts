import { verify } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

import AppError from "../errors/AppError";
import authConfig from "../config/auth";

import { updateUser } from "../helpers/updateUser";
import logger from "../utils/logger";
import CompanyAccessService, {
  canUseBillingOnly
} from "../services/CompanyService/CompanyAccessService";
import { isBillingAllowedPath } from "../helpers/isBillingAllowedPath";

// Interface para Request estendido
interface ExtendedRequest extends Request {
  user?: {
    id: string;
    profile: string;
    companyId: number;
    super?: boolean;
  };
}

interface TokenPayload {
  id: string;
  username?: string;
  usarname?: string;
  profile: string;
  companyId: number;
  super?: boolean;
  iat: number;
  exp: number;
}

const isAuth = async (req: ExtendedRequest, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    throw new AppError("ERR_SESSION_EXPIRED", 401);
  }

  const [, token] = authHeader.split(" ");

  try {
    const decoded = verify(token, authConfig.secret) as TokenPayload;
    const { id, profile, companyId, super: isSuper } = decoded;

    // Atualização do usuário
    await updateUser(id, companyId);

    // Adição segura do usuário ao request
    req.user = {
      id,
      profile,
      companyId,
      super: isSuper
    };

    const access = await CompanyAccessService(companyId);
    if (access.allowed) {
      return next();
    }

    const path = (req.originalUrl || req.path || "").split("?")[0];
    if (canUseBillingOnly(access, profile) && isBillingAllowedPath(req.method, path)) {
      return next();
    }
    if (canUseBillingOnly(access, profile)) {
      throw new AppError("ERR_BILLING_ONLY", 403);
    }

    throw new AppError(access.code ?? "ERR_ACCESS_BLOCKED", 403);
  } catch (err: any) {
    if (err instanceof AppError) {
      throw err;
    }
    // Log apenas erros de autenticação que não sejam esperados
    if (err.name !== 'TokenExpiredError' && err.name !== 'JsonWebTokenError') {
      logger.error({ err, scope: "isAuth" }, "Erro inesperado na autenticação");
    }
    
    if (err.name === 'TokenExpiredError') {
      throw new AppError("ERR_SESSION_EXPIRED", 401);
    } else if (err.name === 'JsonWebTokenError') {
      throw new AppError(
        "Invalid token. We'll try to assign a new one on next request",
        403
      );
    }

    // Erro genérico
    throw new AppError("Authentication failed", 401);
  }
};

export default isAuth;
