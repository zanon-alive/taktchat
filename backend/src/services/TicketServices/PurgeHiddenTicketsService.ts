import { Op } from "sequelize";
import fs from "fs";
import Ticket from "../../models/Ticket";
import Message from "../../models/Message";
import Company from "../../models/Company";
import CompaniesSettings from "../../models/CompaniesSettings";
import logger from "../../utils/logger";
import { isSafeCompanyMediaPath } from "./AnonymizeTicketMessagesService";

interface PurgeOptions {
  now?: Date;
  companyId?: number;
}

const unlinkTicketMedia = async (
  companyId: number,
  ticketId: number
): Promise<void> => {
  const messages = await Message.findAll({
    where: { ticketId, companyId }
  });
  for (const message of messages) {
    const fileRel = message.getDataValue("mediaUrl") as string | null;
    if (!fileRel) continue;
    const { ok, absPath } = isSafeCompanyMediaPath(companyId, fileRel);
    if (!ok || !absPath) continue;
    try {
      await fs.promises.unlink(absPath);
    } catch (err: any) {
      if (err?.code !== "ENOENT") {
        logger.error({ err, absPath }, "Falha ao apagar mídia no purge");
      }
    }
  }
};

export const purgeHiddenTicketsForCompany = async (
  companyId: number,
  retentionDays: number,
  now: Date = new Date()
): Promise<number> => {
  if (!retentionDays || retentionDays <= 0) {
    return 0;
  }

  const cutoff = new Date(now.getTime() - retentionDays * 24 * 60 * 60 * 1000);

  const tickets = await Ticket.unscoped().findAll({
    where: {
      companyId,
      deletedAt: {
        [Op.ne]: null,
        [Op.lt]: cutoff
      }
    },
    attributes: ["id", "companyId", "deletedAt"]
  });

  let purged = 0;
  for (const ticket of tickets) {
    if (!ticket.deletedAt) continue;
    await unlinkTicketMedia(companyId, ticket.id);
    await Message.destroy({ where: { ticketId: ticket.id, companyId } });
    await ticket.destroy();
    purged += 1;
  }

  return purged;
};

const PurgeHiddenTicketsService = async (
  options: PurgeOptions = {}
): Promise<{ companyId: number; purged: number; error?: string }[]> => {
  const now = options.now || new Date();
  const where = options.companyId ? { id: options.companyId } : {};
  const companies = await Company.findAll({ where, attributes: ["id"] });
  const results: { companyId: number; purged: number; error?: string }[] = [];

  for (const company of companies) {
    try {
      const settings = await CompaniesSettings.findOne({
        where: { companyId: company.id },
        attributes: ["hiddenTicketRetentionDays"]
      });
      const days = Number(settings?.hiddenTicketRetentionDays || 0);
      const purged = await purgeHiddenTicketsForCompany(company.id, days, now);
      if (purged > 0) {
        logger.info(
          { companyId: company.id, purged, retentionDays: days },
          "Purge de tickets ocultos"
        );
      }
      results.push({ companyId: company.id, purged });
    } catch (err: any) {
      logger.error({ err, companyId: company.id }, "Falha no purge de tickets ocultos");
      results.push({
        companyId: company.id,
        purged: 0,
        error: err?.message || "unknown"
      });
    }
  }

  return results;
};

export default PurgeHiddenTicketsService;
