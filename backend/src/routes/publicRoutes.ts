import { Router } from "express";
import * as PartnerSignupController from "../controllers/PartnerSignupController";
import * as DirectSignupController from "../controllers/DirectSignupController";
import * as SiteChatController from "../controllers/SiteChatController";
import { rateLimit } from "../middleware/rateLimit";

const publicRoutes = Router();

publicRoutes.get("/partner-signup/config", PartnerSignupController.show);
// Rate limit: 5 tentativas por IP a cada 15 minutos
publicRoutes.post("/partner-signup", rateLimit(5, 15 * 60 * 1000), PartnerSignupController.store);

publicRoutes.get("/direct-signup/config", DirectSignupController.show);
// Rate limit: 5 tentativas por IP a cada 15 minutos
publicRoutes.post("/direct-signup", rateLimit(5, 15 * 60 * 1000), DirectSignupController.store);

// Site Chat API - Rate limit: 20 requisições por IP a cada minuto
publicRoutes.post("/site-chat/submit", rateLimit(20, 60 * 1000), SiteChatController.submit);
publicRoutes.post("/site-chat/message", rateLimit(20, 60 * 1000), SiteChatController.sendMessage);
publicRoutes.get("/site-chat/messages", rateLimit(20, 60 * 1000), SiteChatController.getMessages);

export default publicRoutes;
