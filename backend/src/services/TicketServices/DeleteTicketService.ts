import Ticket from "../../models/Ticket";
import User from "../../models/User";
import AppError from "../../errors/AppError";
import KnowledgeDocument from "../../models/KnowledgeDocument";
import KnowledgeChunk from "../../models/KnowledgeChunk";
import logger from "../../utils/logger";
import {
  assertDeletionPayload,
  isCompanyAdmin,
  ticketDeletionRagSource
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
}: Request): Promise<Ticket> => {
  if (!isCompanyAdmin({ profile, super: isSuper })) {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  const payload = assertDeletionPayload(category, reason);

  const ticket = await Ticket.unscoped().findOne({
    where: { id, companyId }
  });

  if (!ticket) {
    throw new AppError("ERR_NO_TICKET_FOUND", 404);
  }

  if (ticket.deletedAt) {
    throw new AppError("ERR_TICKET_ALREADY_DELETED", 409);
  }

  const actor = await User.findByPk(userId, { attributes: ["id", "name"] });

  await ticket.update({
    deletedAt: new Date(),
    deletedBy: Number(userId) || null,
    deletedByName: actor?.name || null,
    deletionReasonCategory: payload.category,
    deletionReason: payload.reason
  });

  await removeIndexedConversation(ticket.id, companyId);

  return ticket;
};

export default DeleteTicketService;
