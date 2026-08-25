import crypto from "crypto";
import Company from "../models/Company";

const TOKEN_BYTES = 24;

/**
 * Gera um token opaco único para uso na URL de signup do parceiro.
 */
export function generateSignupToken(): string {
  return crypto.randomBytes(TOKEN_BYTES).toString("hex");
}

function isNumericCompanyId(value: string): boolean {
  return /^\d+$/.test(value);
}

/**
 * Resolve partnerId a partir de token ou ID.
 * Token opaco (signupToken) tem prioridade. Id numérico só se a string inteira for dígitos.
 */
export async function resolvePartnerFromTokenOrId(
  tokenOrId: string
): Promise<{ partnerId: number } | null> {
  const trimmed = (tokenOrId || "").trim();
  if (!trimmed) return null;

  const byToken = await Company.findOne({
    where: { signupToken: trimmed, type: "whitelabel" },
    attributes: ["id"]
  });
  if (byToken) {
    return { partnerId: byToken.id };
  }

  if (!isNumericCompanyId(trimmed)) {
    return null;
  }

  const asNum = Number(trimmed);
  const byId = await Company.findOne({
    where: { id: asNum, type: "whitelabel" },
    attributes: ["id"]
  });
  return byId ? { partnerId: byId.id } : null;
}
