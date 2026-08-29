import Ticket from "../../models/Ticket";
import Contact from "../../models/Contact";
import User from "../../models/User";
import Queue from "../../models/Queue";
import Whatsapp from "../../models/Whatsapp";
import Message from "../../models/Message";
import TicketNote from "../../models/TicketNote";
import LogTicket from "../../models/LogTicket";
import AppError from "../../errors/AppError";
import {
  DELETED_MESSAGES_PAGE_MAX,
  DELETED_MESSAGES_PAGE_SIZE
} from "../../helpers/ticketDeletion";

const ShowDeletedTicketService = async (
  id: string,
  companyId: number,
  pageNumber: string | number = "1",
  limitParam?: string | number
): Promise<{
  ticket: Ticket;
  messages: Message[];
  notes: TicketNote[];
  logs: LogTicket[];
  count: number;
  hasMore: boolean;
}> => {
  const ticket = await Ticket.unscoped().findOne({
    where: { id, companyId },
    include: [
      { model: Contact, as: "contact", attributes: ["id", "name", "number"] },
      { model: User, as: "user", attributes: ["id", "name"] },
      { model: Queue, as: "queue", attributes: ["id", "name"] },
      { model: Whatsapp, as: "whatsapp", attributes: ["id", "name"] }
    ]
  });

  if (!ticket || !ticket.deletedAt) {
    throw new AppError("ERR_NO_TICKET_FOUND", 404);
  }

  const page = Math.max(Number(pageNumber) || 1, 1);
  const limit = Math.min(
    Math.max(Number(limitParam) || DELETED_MESSAGES_PAGE_SIZE, 1),
    DELETED_MESSAGES_PAGE_MAX
  );
  const offset = (page - 1) * limit;

  const [messagesResult, notes, logs] = await Promise.all([
    Message.findAndCountAll({
      where: { ticketId: ticket.id, companyId },
      order: [["createdAt", "ASC"]],
      attributes: [
        "id",
        "body",
        "fromMe",
        "mediaType",
        "mediaUrl",
        "createdAt",
        "isPrivate",
        "ack",
        "companyId"
      ],
      limit,
      offset
    }),
    TicketNote.findAll({
      where: { ticketId: ticket.id },
      include: [{ model: User, as: "user", attributes: ["id", "name"] }],
      order: [["createdAt", "DESC"]]
    }),
    LogTicket.findAll({
      where: { ticketId: ticket.id },
      include: [
        { model: User, as: "user", attributes: ["id", "name"] },
        { model: Queue, as: "queue", attributes: ["id", "name"] }
      ],
      order: [["createdAt", "DESC"]]
    })
  ]);

  return {
    ticket,
    messages: messagesResult.rows,
    notes,
    logs,
    count: messagesResult.count,
    hasMore: messagesResult.count > offset + messagesResult.rows.length
  };
};

export default ShowDeletedTicketService;
