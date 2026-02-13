import { Request, Response } from "express";
import PartnerSignupService from "../services/CompanyService/PartnerSignupService";
import Company from "../models/Company";
import Plan from "../models/Plan";
import CompanyAccessService from "../services/CompanyService/CompanyAccessService";
import { resolvePartnerFromTokenOrId } from "../helpers/PartnerSignupToken";

interface Body {
  partnerId?: number;
  token?: string;
  companyName?: string;
  adminName?: string;
  email?: string;
  password?: string;
  planId?: number;
  phone?: string;
}

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { partnerId, token } = req.query;
  const partnerParam = (token as string) || (partnerId as string);

  if (!partnerParam) {
    return res.status(400).json({ error: "Parceiro não especificado (use partner ou token)." });
  }

  try {
    const resolved = await resolvePartnerFromTokenOrId(partnerParam);
    if (!resolved) {
      return res.status(404).json({ error: "Parceiro não encontrado." });
    }

    const partner = await Company.findByPk(resolved.partnerId, {
      attributes: ["id", "name", "type", "trialDaysForChildCompanies", "signupToken"]
    });

    if (!partner || partner.type !== "whitelabel") {
      return res.status(404).json({ error: "Parceiro não encontrado." });
    }

    const access = await CompanyAccessService(partner.id);
    if (!access.allowed) {
      return res.status(400).json({ error: "Parceiro não está disponível para novos cadastros." });
    }

    const plans = await Plan.findAll({
      where: {
        companyId: partner.id,
        targetType: "whitelabel"
      },
      attributes: ["id", "name", "recurrence", "amount", "amountAnnual"]
    });

    if (plans.length === 0) {
      return res.status(400).json({ error: "Parceiro não possui planos disponíveis." });
    }

    return res.json({
      partner: {
        id: partner.id,
        name: partner.name,
        trialDays: partner.trialDaysForChildCompanies ?? 7,
        signupToken: partner.signupToken ?? undefined
      },
      plans
    });
  } catch (e) {
    return res.status(500).json({ error: "Erro ao validar parceiro." });
  }
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const body = req.body as Body;
  let partnerId = body.partnerId;
  if (partnerId == null && body.token) {
    const resolved = await resolvePartnerFromTokenOrId(body.token);
    if (!resolved) {
      return res.status(400).json({ error: "Token de parceiro inválido." });
    }
    partnerId = resolved.partnerId;
  }
  if (partnerId == null) {
    return res.status(400).json({ error: "Parceiro não especificado (partnerId ou token)." });
  }

  const result = await PartnerSignupService({
    partnerId: Number(partnerId),
    companyName: body.companyName ?? "",
    adminName: body.adminName ?? "",
    email: body.email ?? "",
    password: body.password ?? "",
    planId: Number(body.planId),
    phone: body.phone
  });
  return res.status(201).json(result);
};
