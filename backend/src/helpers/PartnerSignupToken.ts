import crypto from "crypto";
import Company from "../models/Company";

const TOKEN_BYTES = 24;

/**
 * Gera um token opaco único para uso na URL de signup do parceiro.
 */
export function generateSignupToken(): string {
  return crypto.randomBytes(TOKEN_BYTES).toString("hex");
}

/**
 * Resolve partnerId a partir de token ou ID.
 * Retorna o companyId do parceiro whitelabel ou null se inválido.
 */
export async function resolvePartnerFromTokenOrId(
  tokenOrId: string
): Promise<{ partnerId: number } | null> {
  const trimmed = (tokenOrId || "").trim();
  if (!trimmed) return null;

  const asNum = parseInt(trimmed, 10);
  if (!Number.isNaN(asNum)) {
    const byId = await Company.findOne({
      where: { id: asNum, type: "whitelabel" },
      attributes: ["id"]
    });
    return byId ? { partnerId: byId.id } : null;
  }

  const byToken = await Company.findOne({
    where: { signupToken: trimmed, type: "whitelabel" },
    attributes: ["id"]
  });
  return byToken ? { partnerId: byToken.id } : null;
}
