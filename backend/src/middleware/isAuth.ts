import { verify } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

import AppError from "../errors/AppError";
import authConfig from "../config/auth";

import { updateUser } from "../helpers/updateUser";

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
  console.log("[DEBUG isAuth] Requisição recebida:", req.method, req.path);
  console.log("[DEBUG isAuth] req.url:", req.url);
  console.log("[DEBUG isAuth] req.originalUrl:", req.originalUrl);
  
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    console.log("[DEBUG isAuth] ERRO: Sem header de autorização");
    throw new AppError("ERR_SESSION_EXPIRED", 401);
  }

  const [, token] = authHeader.split(" ");

  try {
    const decoded = verify(token, authConfig.secret) as TokenPayload;
    const { id, profile, companyId, super: isSuper } = decoded;

    console.log("[DEBUG isAuth] Token decodificado - userId:", id, "companyId:", companyId, "profile:", profile, "super:", isSuper);

    // Atualização do usuário
    await updateUser(id, companyId);

    // Adição segura do usuário ao request
    req.user = {
      id,
      profile,
      companyId,
      super: isSuper
    };

    console.log("[DEBUG isAuth] Autenticação bem-sucedida, chamando next()");
    return next();
  } catch (err: any) {
    console.log("[DEBUG isAuth] Erro na autenticação:", err.name, err.message);
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
