import { Router } from "express";
import * as PartnerSignupController from "../controllers/PartnerSignupController";
import * as DirectSignupController from "../controllers/DirectSignupController";
import { rateLimit } from "../middleware/rateLimit";

const publicRoutes = Router();

publicRoutes.get("/partner-signup/config", PartnerSignupController.show);
// Rate limit: 5 tentativas por IP a cada 15 minutos
publicRoutes.post("/partner-signup", rateLimit(5, 15 * 60 * 1000), PartnerSignupController.store);

publicRoutes.get("/direct-signup/config", DirectSignupController.show);
// Rate limit: 5 tentativas por IP a cada 15 minutos
publicRoutes.post("/direct-signup", rateLimit(5, 15 * 60 * 1000), DirectSignupController.store);

export default publicRoutes;
