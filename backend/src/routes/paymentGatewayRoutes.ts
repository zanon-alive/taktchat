import express from "express";
import isAuth from "../middleware/isAuth";
import * as PaymentGatewayController from "../controllers/PaymentGatewayController";

const paymentGatewayRoutes = express.Router();

// Rotas autenticadas
paymentGatewayRoutes.post("/licenses/:id/create-payment", isAuth, PaymentGatewayController.createPayment);
paymentGatewayRoutes.get("/payments/:paymentId/status", isAuth, PaymentGatewayController.getPaymentStatus);

// Webhook público (sem auth, mas deve validar assinatura)
paymentGatewayRoutes.post("/payments/webhook", PaymentGatewayController.webhook);

export default paymentGatewayRoutes;
