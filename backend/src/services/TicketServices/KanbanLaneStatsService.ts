import Ticket from "../../models/Ticket";
import Tag from "../../models/Tag";
import {
  aggregateKanbanLaneStats,
  findTicketIdsWithKanbanLane,
  kanbanBoardStatusWhere,
  KanbanLaneStat
} from "../../helpers/kanbanTicketTags";

interface Request {
  companyId: number;
}

const KanbanLaneStatsService = async ({
  companyId
}: Request): Promise<KanbanLaneStat[]> => {
  const lanes = await Tag.findAll({
    where: { companyId, kanban: 1 },
    attributes: ["id", "name"],
    order: [["id", "ASC"]]
  });

  const ticketIds = await findTicketIdsWithKanbanLane(companyId);
  const tickets = await Ticket.findAll({
    where: {
      companyId,
      ...kanbanBoardStatusWhere(ticketIds)
    },
    attributes: ["id", "updatedAt"],
    include: [
      {
        model: Tag,
        as: "tags",
        attributes: ["id", "name"],
        where: { kanban: 1, companyId },
        required: true,
        through: { attributes: [] }
      }
    ]
  });

  const rows = tickets.flatMap(ticket =>
    (ticket.tags || []).map(tag => ({
      tagId: tag.id,
      tagName: tag.name,
      updatedAt: ticket.updatedAt
    }))
  );

  const aggregated = aggregateKanbanLaneStats(rows);
  const byId = new Map(aggregated.map(item => [item.tagId, item]));

  return lanes.map(lane => ({
    tagId: lane.id,
    name: lane.name,
    count: byId.get(lane.id)?.count || 0,
    avgAgeHours: byId.get(lane.id)?.avgAgeHours || 0
  }));
};

export default KanbanLaneStatsService;
