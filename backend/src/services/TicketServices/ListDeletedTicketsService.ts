import { Op } from "sequelize";
import Ticket from "../../models/Ticket";
import Contact from "../../models/Contact";
import User from "../../models/User";
import Queue from "../../models/Queue";
import Whatsapp from "../../models/Whatsapp";

interface Request {
  companyId: number;
  pageNumber?: string | number;
  dateStart?: string;
  dateEnd?: string;
  deletedBy?: string | number;
  category?: string;
  searchParam?: string;
}

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

  const where: any = {
    companyId,
    deletedAt: { [Op.ne]: null }
  };

  if (dateStart) {
    where.deletedAt[Op.gte] = new Date(`${dateStart}T00:00:00`);
  }
  if (dateEnd) {
    where.deletedAt[Op.lte] = new Date(`${dateEnd}T23:59:59`);
  }
  if (deletedBy) {
    where.deletedBy = Number(deletedBy);
  }
  if (category) {
    where.deletionReasonCategory = category;
  }

  const include: any[] = [
    {
      model: Contact,
      as: "contact",
      attributes: ["id", "name", "number"],
      required: !!searchParam
    },
    { model: User, as: "user", attributes: ["id", "name"], required: false },
    { model: Queue, as: "queue", attributes: ["id", "name"], required: false },
    { model: Whatsapp, as: "whatsapp", attributes: ["id", "name"], required: false }
  ];

  if (searchParam) {
    const term = `%${searchParam.trim()}%`;
    include[0].where = {
      [Op.or]: [
        { name: { [Op.iLike]: term } },
        { number: { [Op.iLike]: term } }
      ]
    };
  }

  const { count, rows: tickets } = await Ticket.unscoped().findAndCountAll({
    where,
    include,
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

export default ListDeletedTicketsService;
