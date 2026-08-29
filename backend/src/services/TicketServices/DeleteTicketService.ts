import Ticket from "../../models/Ticket";
import Contact from "../../models/Contact";
import User from "../../models/User";
import AppError from "../../errors/AppError";
import KnowledgeDocument from "../../models/KnowledgeDocument";
import KnowledgeChunk from "../../models/KnowledgeChunk";
import logger from "../../utils/logger";
import { Op } from "sequelize";
import CreateLogTicketService from "./CreateLogTicketService";
import AnonymizeTicketMessagesService from "./AnonymizeTicketMessagesService";
import {
  assertDeletionPayload,
  isCompanyAdmin,
  ticketDeletionRagSource,
  TICKET_HIDE_BURST_LIMIT,
  TICKET_HIDE_BURST_WINDOW_MS
} from "../../helpers/ticketDeletion";

interface Request {
  id: string;
  userId: string | number;
  companyId: number;
  profile: string;
  super?: boolean;
  category: unknown;
  reason: unknown;
}

export interface HideTicketResult {
  ticket: Ticket;
  hideCount24h: number;
  burst: boolean;
}

const removeIndexedConversation = async (
  ticketId: string | number,
  companyId: number
): Promise<void> => {
  try {
    const docs = await KnowledgeDocument.findAll({
      where: { companyId, source: ticketDeletionRagSource(ticketId) },
      attributes: ["id"]
    });
    if (!docs.length) return;
    const ids = docs.map(d => d.id);
    await KnowledgeChunk.destroy({ where: { documentId: ids } });
    await KnowledgeDocument.destroy({ where: { id: ids, companyId } });
  } catch (err) {
    logger.error({ err, ticketId, companyId }, "Falha ao limpar RAG do ticket ocultado");
  }
};

const DeleteTicketService = async ({
  id,
  userId,
  companyId,
  profile,
  super: isSuper,
  category,
  reason
}: Request): Promise<HideTicketResult> => {
  if (!isCompanyAdmin({ profile, super: isSuper })) {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  const payload = assertDeletionPayload(category, reason);

  const ticket = await Ticket.unscoped().findOne({
    where: { id, companyId },
    include: [{ model: Contact, as: "contact", attributes: ["id", "name"] }]
  });

  if (!ticket) {
    throw new AppError("ERR_NO_TICKET_FOUND", 404);
  }

  if (ticket.deletedAt) {
    throw new AppError("ERR_TICKET_ALREADY_DELETED", 409);
  }

  const actor = await User.findByPk(userId, { attributes: ["id", "name"] });

  const patch: Record<string, unknown> = {
    deletedAt: new Date(),
    deletedBy: Number(userId) || null,
    deletedByName: actor?.name || null,
    deletionReasonCategory: payload.category,
    deletionReason: payload.reason
  };

  await ticket.update(patch);

  try {
    await CreateLogTicketService({
      type: "delete",
      ticketId: ticket.id,
      userId,
      queueId: ticket.queueId
    });
  } catch (err) {
    logger.error({ err, ticketId: ticket.id }, "Falha ao gravar LogTicket no hide");
  }

  if (payload.category === "lgpd") {
    await AnonymizeTicketMessagesService(ticket.id, companyId);
    await ticket.update({ anonymizedAt: new Date() });
  }

  await removeIndexedConversation(ticket.id, companyId);

  let hideCount24h = 1;
  try {
    hideCount24h = await Ticket.unscoped().count({
      where: {
        companyId,
        deletedBy: Number(userId),
        deletedAt: { [Op.gte]: new Date(Date.now() - TICKET_HIDE_BURST_WINDOW_MS) }
      }
    });
  } catch (err) {
    logger.error({ err, companyId, userId }, "Falha ao contar burst de hide");
  }

  return {
    ticket,
    hideCount24h,
    burst: hideCount24h >= TICKET_HIDE_BURST_LIMIT
  };
};

export default DeleteTicketService;
