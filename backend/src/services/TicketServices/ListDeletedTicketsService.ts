import { Op } from "sequelize";
import { parseISO, startOfDay, endOfDay } from "date-fns";
import Ticket from "../../models/Ticket";
import Contact from "../../models/Contact";
import User from "../../models/User";
import Queue from "../../models/Queue";
import Whatsapp from "../../models/Whatsapp";
import { DELETED_TICKETS_CSV_MAX } from "../../helpers/ticketDeletion";
import AppError from "../../errors/AppError";

interface Request {
  companyId: number;
  pageNumber?: string | number;
  dateStart?: string;
  dateEnd?: string;
  deletedBy?: string | number;
  category?: string;
  searchParam?: string;
  unlimited?: boolean;
}

const buildWhere = ({
  companyId,
  dateStart,
  dateEnd,
  deletedBy,
  category
}: Request) => {
  const where: any = {
    companyId,
    deletedAt: { [Op.ne]: null }
  };

  if (dateStart) {
    where.deletedAt[Op.gte] = startOfDay(parseISO(dateStart));
  }
  if (dateEnd) {
    where.deletedAt[Op.lte] = endOfDay(parseISO(dateEnd));
  }
  if (deletedBy) {
    where.deletedBy = Number(deletedBy);
  }
  if (category) {
    where.deletionReasonCategory = category;
  }

  return where;
};

const contactInclude = (searchParam?: string) => {
  const include: any = {
    model: Contact,
    as: "contact",
    attributes: ["id", "name", "number"],
    required: !!searchParam
  };
  if (searchParam) {
    const term = `%${searchParam.trim()}%`;
    include.where = {
      [Op.or]: [
        { name: { [Op.iLike]: term } },
        { number: { [Op.iLike]: term } }
      ]
    };
  }
  return include;
};

const baseInclude = (searchParam?: string) => [
  contactInclude(searchParam),
  { model: User, as: "user", attributes: ["id", "name"], required: false },
  { model: Queue, as: "queue", attributes: ["id", "name"], required: false },
  { model: Whatsapp, as: "whatsapp", attributes: ["id", "name"], required: false }
];

const ListDeletedTicketsService = async ({
  companyId,
  pageNumber = "1",
  dateStart,
  dateEnd,
  deletedBy,
  category,
  searchParam = ""
}: Request) => {
  const limit = 20;
  const page = Math.max(Number(pageNumber) || 1, 1);
  const offset = (page - 1) * limit;

  const { count, rows: tickets } = await Ticket.unscoped().findAndCountAll({
    where: buildWhere({ companyId, dateStart, dateEnd, deletedBy, category }),
    include: baseInclude(searchParam),
    distinct: true,
    limit,
    offset,
    order: [["deletedAt", "DESC"]]
  });

  return {
    tickets,
    count,
    hasMore: count > offset + tickets.length
  };
};

export const countDeletedTickets = async (params: Request): Promise<number> => {
  return Ticket.unscoped().count({
    where: buildWhere(params),
    include: params.searchParam ? [contactInclude(params.searchParam)] : [],
    distinct: true
  });
};

export const listDeletedTicketsForExport = async (
  params: Request
): Promise<Ticket[]> => {
  const total = await countDeletedTickets(params);
  if (total > DELETED_TICKETS_CSV_MAX) {
    throw new AppError("ERR_DELETED_TICKETS_CSV_LIMIT", 400);
  }

  return Ticket.unscoped().findAll({
    where: buildWhere(params),
    include: baseInclude(params.searchParam),
    order: [["deletedAt", "DESC"]],
    limit: DELETED_TICKETS_CSV_MAX
  });
};

export default ListDeletedTicketsService;
