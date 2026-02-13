import { Request, Response } from "express";
import PaymentGatewayService, { PaymentRequest } from "../services/PaymentGateway/PaymentGatewayService";
import License from "../models/License";
import Plan from "../models/Plan";
import { getRequestUser } from "./LicenseController";

const paymentGateway = new PaymentGatewayService();

export const createPayment = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;
  const { requestUserCompanyId, requestUserSuper } = await getRequestUser(req);

  const license = await License.findByPk(id, {
    include: [{ model: Plan, as: "plan" }]
  });

  if (!license) {
    return res.status(404).json({ error: "Licença não encontrada." });
  }

  const plan = (license as any).plan as Plan;
  const amount = license.recurrence === "ANUAL" && plan?.amountAnnual
    ? parseFloat(plan.amountAnnual)
    : parseFloat(plan?.amount || license.amount || "0");

  const paymentRequest: PaymentRequest = {
    licenseId: license.id,
    amount,
    currency: "BRL",
    description: `Renovação de licença - ${plan?.name || "Plano"} (${license.recurrence || "MENSAL"})`,
    metadata: {
      companyId: license.companyId,
      planId: license.planId
    }
  };

  try {
    const payment = await paymentGateway.createPayment(paymentRequest);
    return res.status(200).json(payment);
  } catch (err: any) {
    return res.status(err.statusCode || 500).json({
      error: err.message || "Erro ao criar pagamento."
    });
  }
};

export const getPaymentStatus = async (req: Request, res: Response): Promise<Response> => {
  const { paymentId } = req.params;

  try {
    const status = await paymentGateway.getPaymentStatus(paymentId);
    return res.status(200).json(status);
  } catch (err: any) {
    return res.status(err.statusCode || 500).json({
      error: err.message || "Erro ao verificar status do pagamento."
    });
  }
};

export const webhook = async (req: Request, res: Response): Promise<Response> => {
  const signature = req.headers["x-signature"] || req.headers["stripe-signature"] || "";
  const payload = req.body;

  try {
    const result = await paymentGateway.processWebhook(payload, String(signature));
    return res.status(200).json(result);
  } catch (err: any) {
    return res.status(400).json({
      error: err.message || "Erro ao processar webhook."
    });
  }
};
