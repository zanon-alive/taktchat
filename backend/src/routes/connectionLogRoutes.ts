import express from "express";
import isAuth from "../middleware/isAuth";
import * as ConnectionLogController from "../controllers/ConnectionLogController";

const connectionLogRoutes = express.Router();

connectionLogRoutes.get(
    "/connection-logs/whatsapp/:whatsappId",
    isAuth,
    ConnectionLogController.index
);

connectionLogRoutes.get(
    "/connection-logs/recent",
    isAuth,
    ConnectionLogController.recent
);

connectionLogRoutes.get(
    "/connection-logs/metrics/:whatsappId",
    isAuth,
    ConnectionLogController.metrics
);

export default connectionLogRoutes;
