import PurgeHiddenTicketsService from "../services/TicketServices/PurgeHiddenTicketsService";
import logger from "../utils/logger";

const PurgeHiddenTicketsJob = {
  key: "PurgeHiddenTickets",
  handle: async () => {
    logger.info("Iniciando job de retenção de tickets ocultos");
    const results = await PurgeHiddenTicketsService();
    const total = results.reduce((sum, r) => sum + r.purged, 0);
    const failures = results.filter(r => r.error).length;
    logger.info({ total, failures, companies: results.length }, "Job de retenção concluído");
    return { total, failures };
  }
};

export default PurgeHiddenTicketsJob;
