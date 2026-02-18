import crypto from "crypto";
import Company from "../../models/Company";
import AppError from "../../errors/AppError";

const TOKEN_BYTES = 24;

function generateSiteChatToken(): string {
  return crypto.randomBytes(TOKEN_BYTES).toString("hex");
}

/**
 * Retorna o siteChatToken da empresa, gerando um novo se não existir.
 * Funciona para qualquer tipo de empresa (direct, whitelabel, platform).
 */
const GetOrCreateSiteChatTokenService = async (
  companyId: number
): Promise<{ siteChatToken: string }> => {
  const company = await Company.findByPk(companyId, {
    attributes: ["id", "siteChatToken"]
  });

  if (!company) {
    throw new AppError("Empresa não encontrada.", 404);
  }

  if (company.siteChatToken) {
    return { siteChatToken: company.siteChatToken };
  }

  let token = "";
  let exists = true;
  while (exists) {
    token = generateSiteChatToken();
    const duplicate = await Company.findOne({
      where: { siteChatToken: token },
      attributes: ["id"]
    });
    exists = !!duplicate;
  }

  await company.update({ siteChatToken: token });
  return { siteChatToken: token };
};

export default GetOrCreateSiteChatTokenService;
