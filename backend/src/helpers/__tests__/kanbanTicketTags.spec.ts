import { Op } from "sequelize";
import {
  applyDefaultKanbanLane,
  applyClosedKanbanLane,
  findTicketIdsWithKanbanLane,
  getKanbanLaneSettings,
  isTerminalKanbanLane,
  kanbanBoardStatusWhere,
  replaceKanbanLane,
  shouldWarnKanbanColumnCount,
  aggregateKanbanLaneStats
} from "../kanbanTicketTags";
import Setting from "../../models/Setting";
import Tag from "../../models/Tag";
import TicketTag from "../../models/TicketTag";
import Company from "../../models/Company";

jest.mock("../../models/Setting", () => ({
  __esModule: true,
  default: { findAll: jest.fn() }
}));
jest.mock("../../models/Tag", () => ({
  __esModule: true,
  default: { findAll: jest.fn(), findOne: jest.fn() }
}));
jest.mock("../../models/TicketTag", () => ({
  __esModule: true,
  default: { findAll: jest.fn(), findOne: jest.fn(), destroy: jest.fn(), create: jest.fn() }
}));
jest.mock("../../models/Company", () => ({
  __esModule: true,
  default: { findByPk: jest.fn() }
}));
jest.mock("../../models/Plan", () => ({
  __esModule: true,
  default: {}
}));

describe("kanbanTicketTags", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (Company.findByPk as jest.Mock).mockResolvedValue({
      id: 1,
      type: "direct",
      plan: { useKanban: true }
    });
  });

  it("lê as lanes configuradas da empresa", async () => {
    (Setting.findAll as jest.Mock).mockResolvedValue([
      { key: "defaultKanbanTagId", value: "10" },
      { key: "closedKanbanTagId", value: "20" }
    ]);

    await expect(getKanbanLaneSettings(1)).resolves.toEqual({
      defaultTagId: 10,
      closedTagId: 20
    });
  });

  it("substitui as tags kanban do ticket pela lane informada", async () => {
    (TicketTag.findAll as jest.Mock).mockResolvedValue([{ tagId: 10 }]);
    (Tag.findAll as jest.Mock).mockResolvedValue([{ id: 10 }]);
    (Tag.findOne as jest.Mock).mockResolvedValue({ id: 20 });

    await replaceKanbanLane(5, 1, 20);

    expect(TicketTag.destroy).toHaveBeenCalledWith({
      where: { ticketId: 5, tagId: [10] }
    });
    expect(TicketTag.create).toHaveBeenCalledWith({ ticketId: 5, tagId: 20 });
  });

  it("não aplica lane de entrada se o ticket já tem coluna kanban", async () => {
    (TicketTag.findOne as jest.Mock).mockResolvedValue({ tagId: 10 });
    (Setting.findAll as jest.Mock).mockResolvedValue([
      { key: "defaultKanbanTagId", value: "10" }
    ]);

    await applyDefaultKanbanLane(5, 1);

    expect(TicketTag.create).not.toHaveBeenCalled();
  });

  it("aplica lane de encerrar quando configurada", async () => {
    (Setting.findAll as jest.Mock).mockResolvedValue([
      { key: "closedKanbanTagId", value: "20" }
    ]);
    (TicketTag.findAll as jest.Mock).mockResolvedValue([]);
    (Tag.findOne as jest.Mock).mockResolvedValue({ id: 20 });

    await applyClosedKanbanLane(5, 1);

    expect(TicketTag.create).toHaveBeenCalledWith({ ticketId: 5, tagId: 20 });
  });

  it("ao encerrar usa a lane informada ou sai do quadro", async () => {
    (TicketTag.findAll as jest.Mock).mockResolvedValue([{ tagId: 10 }]);
    (Tag.findAll as jest.Mock).mockResolvedValue([{ id: 10 }]);
    (Tag.findOne as jest.Mock).mockResolvedValue({ id: 21 });

    await applyClosedKanbanLane(5, 1, { tagId: 21 });
    expect(TicketTag.create).toHaveBeenCalledWith({ ticketId: 5, tagId: 21 });

    await applyClosedKanbanLane(5, 1, { leaveBoard: true });
    expect(TicketTag.create).toHaveBeenCalledTimes(1);
  });

  it("reconhece lane terminal pelo id configurado ou pelo nome Fechado", () => {
    expect(isTerminalKanbanLane({ id: 20, name: "Negociação" }, 20)).toBe(true);
    expect(isTerminalKanbanLane({ id: 7, name: "Fechado ganho" }, 20)).toBe(true);
    expect(isTerminalKanbanLane({ id: 7, name: "Qualificado" }, 20)).toBe(false);
  });

  it("avisa quando o quadro passa de 8 colunas", () => {
    expect(shouldWarnKanbanColumnCount(8)).toBe(false);
    expect(shouldWarnKanbanColumnCount(9)).toBe(true);
  });

  it("agrega quantidade e idade média por lane", () => {
    const now = new Date("2026-08-25T12:00:00.000Z");
    const stats = aggregateKanbanLaneStats(
      [
        { tagId: 1, tagName: "Lead", updatedAt: "2026-08-25T10:00:00.000Z" },
        { tagId: 1, tagName: "Lead", updatedAt: "2026-08-25T06:00:00.000Z" },
        { tagId: 2, tagName: "Fechado ganho", updatedAt: "2026-08-24T12:00:00.000Z" }
      ],
      now
    );

    expect(stats).toEqual([
      { tagId: 1, name: "Lead", count: 2, avgAgeHours: 4 },
      { tagId: 2, name: "Fechado ganho", count: 1, avgAgeHours: 24 }
    ]);
  });

  it("inclui closed só quando o ticket tem lane kanban", () => {
    const where = kanbanBoardStatusWhere([42]);
    expect(where[Op.or]).toEqual([
      { status: { [Op.in]: ["pending", "open"] } },
      { status: "closed", id: { [Op.in]: [42] } }
    ]);
  });

  it("não abre o filtro de closed para todos os ids quando a lista está vazia", () => {
    const where = kanbanBoardStatusWhere([]);
    expect(where[Op.or][1]).toEqual({
      status: "closed",
      id: { [Op.in]: [0] }
    });
  });

  it("lista ids de tickets com tag kanban=1 da empresa", async () => {
    (TicketTag.findAll as jest.Mock).mockResolvedValue([
      { ticketId: 12 },
      { ticketId: 12 },
      { ticketId: 15 }
    ]);

    await expect(findTicketIdsWithKanbanLane(3)).resolves.toEqual([12, 15]);
    expect(TicketTag.findAll).toHaveBeenCalledWith(
      expect.objectContaining({
        attributes: ["ticketId"],
        include: [
          expect.objectContaining({
            as: "tag",
            where: { kanban: 1, companyId: 3 }
          })
        ]
      })
    );
  });
});
