import { Op } from "sequelize";
import Setting from "../models/Setting";
import Tag from "../models/Tag";
import TicketTag from "../models/TicketTag";
import Company from "../models/Company";
import Plan from "../models/Plan";

export const KANBAN_SETTING_DEFAULT = "defaultKanbanTagId";
export const KANBAN_SETTING_CLOSED = "closedKanbanTagId";

const parseTagId = (value?: string | null): number | null => {
  if (!value || value === "0") return null;
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
};

export async function getKanbanLaneSettings(
  companyId: number
): Promise<{ defaultTagId: number | null; closedTagId: number | null }> {
  const rows = await Setting.findAll({
    where: {
      companyId,
      key: { [Op.in]: [KANBAN_SETTING_DEFAULT, KANBAN_SETTING_CLOSED] }
    }
  });
  const map = new Map(rows.map(row => [row.key, row.value]));
  return {
    defaultTagId: parseTagId(map.get(KANBAN_SETTING_DEFAULT)),
    closedTagId: parseTagId(map.get(KANBAN_SETTING_CLOSED))
  };
}

export async function companyUsesKanban(companyId: number): Promise<boolean> {
  const company = await Company.findByPk(companyId, {
    include: [{ model: Plan, as: "plan", attributes: ["useKanban"] }]
  });
  if (!company) return false;
  return company.plan?.useKanban || company.type === "platform";
}

export async function findKanbanTicketTag(
  ticketId: number
): Promise<TicketTag | null> {
  const row = await TicketTag.findOne({
    where: { ticketId },
    include: [{ model: Tag, as: "tag", where: { kanban: 1 }, required: true }]
  });
  return row || null;
}

export async function replaceKanbanLane(
  ticketId: number,
  companyId: number,
  tagId: number | null
): Promise<void> {
  const ticketTags = await TicketTag.findAll({ where: { ticketId } });
  const currentIds = ticketTags.map(item => item.tagId);
  if (currentIds.length > 0) {
    const kanbanTags = await Tag.findAll({
      where: { id: currentIds, kanban: 1, companyId }
    });
    const kanbanIds = kanbanTags.map(tag => tag.id);
    if (kanbanIds.length > 0) {
      await TicketTag.destroy({ where: { ticketId, tagId: kanbanIds } });
    }
  }

  if (!tagId) return;

  const tag = await Tag.findOne({
    where: { id: tagId, companyId, kanban: 1 }
  });
  if (!tag) return;

  await TicketTag.create({ ticketId, tagId: tag.id });
}

export async function applyDefaultKanbanLane(
  ticketId: number,
  companyId: number
): Promise<void> {
  if (!(await companyUsesKanban(companyId))) return;
  const already = await findKanbanTicketTag(ticketId);
  if (already) return;
  const { defaultTagId } = await getKanbanLaneSettings(companyId);
  if (!defaultTagId) return;
  await replaceKanbanLane(ticketId, companyId, defaultTagId);
}

export async function applyClosedKanbanLane(
  ticketId: number,
  companyId: number
): Promise<void> {
  if (!(await companyUsesKanban(companyId))) return;
  const { closedTagId } = await getKanbanLaneSettings(companyId);
  if (!closedTagId) return;
  await replaceKanbanLane(ticketId, companyId, closedTagId);
}

export function isTerminalKanbanLane(
  tag: { id?: number; name?: string } | null | undefined,
  closedTagId: number | null
): boolean {
  if (!tag) return false;
  if (closedTagId && tag.id === closedTagId) return true;
  return /fechado/i.test(tag.name || "");
}

/**
 * Tickets `closed` só entram no quadro se tiverem lane (`kanban=1`).
 * Sem isso, Encerrar some o card e a lane0 encheria de histórico.
 */
export function kanbanBoardStatusWhere(ticketIdsWithKanbanLane: number[]) {
  const closedIds =
    ticketIdsWithKanbanLane.length > 0 ? ticketIdsWithKanbanLane : [0];

  return {
    [Op.or]: [
      { status: { [Op.in]: ["pending", "open"] } },
      { status: "closed", id: { [Op.in]: closedIds } }
    ]
  };
}

export async function findTicketIdsWithKanbanLane(
  companyId: number
): Promise<number[]> {
  const rows = await TicketTag.findAll({
    attributes: ["ticketId"],
    include: [
      {
        model: Tag,
        as: "tag",
        attributes: [],
        required: true,
        where: { kanban: 1, companyId }
      }
    ],
    raw: true
  });

  const ids = rows
    .map((row: { ticketId?: number }) => Number(row.ticketId))
    .filter(id => Number.isInteger(id) && id > 0);

  return [...new Set(ids)];
}
