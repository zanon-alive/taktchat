import { Request, Response } from "express";
import DirectSignupService from "../services/CompanyService/DirectSignupService";
import Plan from "../models/Plan";
import CompaniesSettings from "../models/CompaniesSettings";
import { getPlatformCompanyId } from "../config/platform";

interface Body {
  companyName?: string;
  adminName?: string;
  email?: string;
  password?: string;
  planId?: number;
  phone?: string;
}

export const show = async (req: Request, res: Response): Promise<Response> => {
  const platformCompanyId = getPlatformCompanyId();

  try {
    // Verificar se cadastro direto está habilitado
    const platformSettings = await CompaniesSettings.findOne({
      where: { companyId: platformCompanyId }
    });

    if (!platformSettings || !platformSettings.enableLandingSignup) {
      return res.status(403).json({ 
        enabled: false,
        error: "Cadastro direto não está disponível no momento." 
      });
    }

    // Buscar planos diretos da plataforma
    const plans = await Plan.findAll({
      where: {
        companyId: platformCompanyId,
        targetType: "direct"
      },
      attributes: ["id", "name", "recurrence", "amount", "amountAnnual"]
    });

    return res.json({
      enabled: true,
      trialDays: 14,
      plans: plans.length > 0 ? plans : []
    });
  } catch (e) {
    return res.status(500).json({ error: "Erro ao verificar configuração." });
  }
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const body = req.body as Body;

  if (!body.companyName || !body.adminName || !body.email || !body.password || !body.planId) {
    return res.status(400).json({ error: "Todos os campos obrigatórios devem ser preenchidos." });
  }

  try {
    const result = await DirectSignupService({
      companyName: body.companyName,
      adminName: body.adminName,
      email: body.email,
      password: body.password,
      planId: Number(body.planId),
      phone: body.phone
    });
    return res.status(201).json(result);
  } catch (error: any) {
    return res.status(error.status || 500).json({ 
      error: error.message || "Erro ao realizar cadastro." 
    });
  }
};
