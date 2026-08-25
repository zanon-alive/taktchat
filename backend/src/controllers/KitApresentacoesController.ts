import { Request, Response } from "express";
import fs from "fs";
import path from "path";
import AppError from "../errors/AppError";
import {
  kitApresentacoesDir,
  userCanViewKitApresentacoes
} from "../helpers/canViewKitApresentacoes";

const FILE_RE = /^[a-zA-Z0-9._-]+\.png$/i;

export const show = async (req: Request, res: Response): Promise<Response> => {
  const allowed = await userCanViewKitApresentacoes(req.user?.id || "");
  if (!allowed) {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  const file = String(req.params.file || "");
  if (!FILE_RE.test(file)) {
    throw new AppError("ERR_INVALID_PARAM", 400);
  }

  const kitDir = kitApresentacoesDir();
  const full = path.resolve(kitDir, file);
  const relative = path.relative(kitDir, full);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new AppError("ERR_INVALID_PARAM", 400);
  }

  if (!fs.existsSync(full)) {
    throw new AppError("ERR_NO_IMAGE_FOUND", 404);
  }

  res.setHeader("Cache-Control", "private, max-age=3600");
  await new Promise<void>((resolve, reject) => {
    res.sendFile(full, (err) => (err ? reject(err) : resolve()));
  });
  return res;
};
