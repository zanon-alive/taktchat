import fs from "fs";
import path from "path";
import User from "../models/User";
import Company from "../models/Company";
import { hasPermission } from "./PermissionAdapter";

export const KIT_APRESENTACOES_PERMISSION = "apresentacoes.view";

export function kitApresentacoesDir(): string {
  const candidates = [
    path.resolve(process.cwd(), "kit-apresentacoes"),
    path.resolve(process.cwd(), "private", "kit-apresentacoes"),
    path.resolve(__dirname, "..", "..", "private", "kit-apresentacoes")
  ];
  const found = candidates.find(dir => fs.existsSync(dir));
  return found || candidates[1];
}

export function stripKitPermissionIfNotPlatform(
  permissions: string[] | undefined | null,
  companyType?: string | null
): string[] {
  const list = Array.isArray(permissions) ? [...permissions] : [];
  if (companyType === "platform") return list;
  return list.filter(item => item !== KIT_APRESENTACOES_PERMISSION);
}

async function loadUserWithCompany(userId: string | number): Promise<User | null> {
  return User.findByPk(userId, {
    include: [{ model: Company, attributes: ["id", "type"] }]
  });
}

export async function userCompanyCanSeeKitCatalog(
  userId: string | number
): Promise<boolean> {
  const user = await loadUserWithCompany(userId);
  if (!user) return false;
  if (user.super === true) return true;
  return user.company?.type === "platform";
}

export async function userCanViewKitApresentacoes(
  userId: string | number
): Promise<boolean> {
  const user = await loadUserWithCompany(userId);
  if (!user) return false;
  if (user.super === true) return true;

  const isPlatform = user.company?.type === "platform";
  if (!isPlatform) return false;
  if (user.profile === "admin") return true;
  return hasPermission(user, KIT_APRESENTACOES_PERMISSION);
}
