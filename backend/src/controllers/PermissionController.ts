import { Request, Response } from "express";
import { getPermissionsCatalog, getAllAvailablePermissions } from "../helpers/PermissionAdapter";
import { userCompanyCanSeeKitCatalog } from "../helpers/canViewKitApresentacoes";

export const index = async (req: Request, res: Response): Promise<Response> => {
  const includeKitProduto = await userCompanyCanSeeKitCatalog(req.user?.id || "");
  const catalog = getPermissionsCatalog({ includeKitProduto });
  return res.status(200).json(catalog);
};

export const list = async (req: Request, res: Response): Promise<Response> => {
  const includeKitProduto = await userCompanyCanSeeKitCatalog(req.user?.id || "");
  const permissions = getAllAvailablePermissions({ includeKitProduto });
  return res.status(200).json(permissions);
};
