import express, { Request, Response } from "express";
import logger from "../utils/logger";

const PORT = Number(process.env.PORT || 8080);
const INTERNAL_TOKEN = String(process.env.LABEL_SYNC_INTERNAL_TOKEN || "");

function requireInternalToken(req: Request, res: Response, next: any) {
  if (!INTERNAL_TOKEN) {
    return res.status(500).json({ success: false, error: "LABEL_SYNC_INTERNAL_TOKEN não configurado" });
  }
  const token = String(req.header("X-Internal-Token") || "");
  if (token !== INTERNAL_TOKEN) {
    return res.status(401).json({ success: false, error: "Unauthorized" });
  }
  return next();
}

async function main() {
  const app = express();
  app.disable("x-powered-by");
  app.use(express.json({ limit: "1mb" }));

  app.get("/health", (_req, res) => res.json({ ok: true }));

  app.get("/internal/whatsapp-web/labels", requireInternalToken, async (req, res) => {
    try {
      const companyId = Number(req.query.companyId);
      const whatsappId = req.query.whatsappId ? Number(req.query.whatsappId) : undefined;
      if (!companyId) return res.status(400).json({ success: false, error: "companyId não informado" });

      const whatsAppWebLabelsService = require("../services/WbotServices/WhatsAppWebLabelsService").default;
      const labels = await whatsAppWebLabelsService.getDeviceLabels(companyId, whatsappId);
      return res.json({ success: true, labels, count: labels.length, source: "whatsapp-web.js" });
    } catch (error: any) {
      logger.error(`[internal labels] Erro: ${error?.message}`);
      return res.status(500).json({ success: false, error: error?.message || "Erro ao buscar labels" });
    }
  });

  app.post("/internal/whatsapp-web/labels/full-sync", requireInternalToken, async (req, res) => {
    try {
      const companyId = Number(req.query.companyId);
      const whatsappId = req.query.whatsappId ? Number(req.query.whatsappId) : undefined;
      if (!companyId) return res.status(400).json({ success: false, error: "companyId não informado" });
      if (!whatsappId) return res.status(400).json({ success: false, error: "whatsappId não informado" });

      const RebuildDeviceTagsService = require("../services/WbotServices/RebuildDeviceTagsService").default;
      const LabelSyncService = require("../services/WbotServices/LabelSyncService").default;
      const rebuild = await RebuildDeviceTagsService(companyId, whatsappId);
      const sync = await LabelSyncService.sync({ companyId, whatsappId, force: true, useWebClient: true });
      return res.json({ success: true, rebuild, sync });
    } catch (error: any) {
      logger.error(`[internal full-sync] Erro: ${error?.message}`);
      return res.status(500).json({ success: false, error: error?.message || "Erro ao executar full sync" });
    }
  });

  app.listen(PORT, () => {
    logger.info(`[label-sync-server] listening on port ${PORT}`);
  });
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});

