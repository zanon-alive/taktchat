import Ticket from "../../models/Ticket";
import Contact from "../../models/Contact";
import User from "../../models/User";
import Queue from "../../models/Queue";
import Whatsapp from "../../models/Whatsapp";
import Message from "../../models/Message";
import TicketNote from "../../models/TicketNote";
import LogTicket from "../../models/LogTicket";
import AppError from "../../errors/AppError";

const ShowDeletedTicketService = async (
  id: string,
  companyId: number
): Promise<{
  ticket: Ticket;
  messages: Message[];
  notes: TicketNote[];
  logs: LogTicket[];
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

  const [messages, notes, logs] = await Promise.all([
    Message.findAll({
      where: { ticketId: ticket.id, companyId },
      order: [["createdAt", "ASC"]],
      attributes: ["id", "body", "fromMe", "mediaType", "mediaUrl", "createdAt", "isPrivate", "ack", "companyId"]
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

  return { ticket, messages, notes, logs };
};

export default ShowDeletedTicketService;
