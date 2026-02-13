import AppError from "../../errors/AppError";
import License from "../../models/License";
import Plan from "../../models/Plan";
import logger from "../../utils/logger";

export interface PaymentGatewayConfig {
  provider: "stripe" | "pagseguro" | "mercadopago" | "manual";
  apiKey?: string;
  secretKey?: string;
  webhookSecret?: string;
  enabled: boolean;
}

export interface PaymentRequest {
  licenseId: number;
  amount: number;
  currency: string;
  description: string;
  metadata?: Record<string, any>;
}

export interface PaymentResponse {
  paymentId: string;
  status: "pending" | "processing" | "completed" | "failed";
  gateway: string;
  gatewayTransactionId?: string;
  paymentUrl?: string;
  expiresAt?: Date;
}

/**
 * Serviço base para integração com gateways de pagamento.
 * Estrutura preparada para futuras integrações (Stripe, PagSeguro, etc.).
 * Por enquanto, apenas valida e prepara dados; a integração real será implementada conforme necessidade.
 */
class PaymentGatewayService {
  private config: PaymentGatewayConfig;

  constructor(config?: Partial<PaymentGatewayConfig>) {
    this.config = {
      provider: process.env.PAYMENT_GATEWAY_PROVIDER as any || "manual",
      apiKey: process.env.PAYMENT_GATEWAY_API_KEY,
      secretKey: process.env.PAYMENT_GATEWAY_SECRET_KEY,
      webhookSecret: process.env.PAYMENT_GATEWAY_WEBHOOK_SECRET,
      enabled: process.env.PAYMENT_GATEWAY_ENABLED === "true",
      ...config
    };
  }

  /**
   * Cria uma solicitação de pagamento para uma licença.
   * Por enquanto, apenas valida e retorna estrutura; integração real será implementada depois.
   */
  async createPayment(request: PaymentRequest): Promise<PaymentResponse> {
    const license = await License.findByPk(request.licenseId, {
      include: [{ model: Plan, as: "plan" }]
    });

    if (!license) {
      throw new AppError("Licença não encontrada.", 404);
    }

    if (!this.config.enabled || this.config.provider === "manual") {
      logger.info(`[PaymentGateway] Pagamento manual para licença ${request.licenseId}. Gateway desabilitado ou modo manual.`);
      return {
        paymentId: `manual-${Date.now()}-${request.licenseId}`,
        status: "pending",
        gateway: "manual",
        paymentUrl: undefined
      };
    }

    // TODO: Implementar integração real com gateway quando necessário
    // Exemplo para Stripe:
    // if (this.config.provider === "stripe") {
    //   const stripe = require("stripe")(this.config.secretKey);
    //   const session = await stripe.checkout.sessions.create({
    //     payment_method_types: ["card"],
    //     line_items: [{
    //       price_data: {
    //         currency: request.currency,
    //         product_data: { name: request.description },
    //         unit_amount: request.amount * 100
    //       },
    //       quantity: 1
    //     }],
    //     mode: "payment",
    //     success_url: `${process.env.FRONTEND_URL}/licenses?payment=success`,
    //     cancel_url: `${process.env.FRONTEND_URL}/licenses?payment=cancel`,
    //     metadata: { licenseId: String(request.licenseId), ...request.metadata }
    //   });
    //   return {
    //     paymentId: session.id,
    //     status: "pending",
    //     gateway: "stripe",
    //     gatewayTransactionId: session.id,
    //     paymentUrl: session.url,
    //     expiresAt: new Date(session.expires_at * 1000)
    //   };
    // }

    throw new AppError(`Gateway de pagamento "${this.config.provider}" não implementado ainda.`, 501);
  }

  /**
   * Verifica o status de um pagamento.
   */
  async getPaymentStatus(paymentId: string): Promise<PaymentResponse> {
    if (!this.config.enabled || this.config.provider === "manual") {
      return {
        paymentId,
        status: "pending",
        gateway: "manual"
      };
    }

    // TODO: Implementar verificação real quando gateway estiver integrado
    throw new AppError(`Verificação de pagamento não implementada para "${this.config.provider}".`, 501);
  }

  /**
   * Processa webhook de um gateway (para confirmação automática de pagamento).
   */
  async processWebhook(payload: any, signature: string): Promise<{ success: boolean; licenseId?: number }> {
    if (!this.config.enabled || this.config.provider === "manual") {
      return { success: false };
    }

    // TODO: Implementar processamento de webhook quando gateway estiver integrado
    // Exemplo para Stripe:
    // if (this.config.provider === "stripe") {
    //   const stripe = require("stripe")(this.config.secretKey);
    //   const event = stripe.webhooks.constructEvent(payload, signature, this.config.webhookSecret);
    //   if (event.type === "checkout.session.completed") {
    //     const session = event.data.object;
    //     const licenseId = parseInt(session.metadata.licenseId);
    //     // Chamar RegisterPaymentService aqui
    //     return { success: true, licenseId };
    //   }
    // }

    return { success: false };
  }
}

export default PaymentGatewayService;
