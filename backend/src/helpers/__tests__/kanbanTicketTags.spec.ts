import {
  applyDefaultKanbanLane,
  applyClosedKanbanLane,
  getKanbanLaneSettings,
  isTerminalKanbanLane,
  replaceKanbanLane
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

  it("reconhece lane terminal pelo id configurado ou pelo nome Fechado", () => {
    expect(isTerminalKanbanLane({ id: 20, name: "Negociação" }, 20)).toBe(true);
    expect(isTerminalKanbanLane({ id: 7, name: "Fechado ganho" }, 20)).toBe(true);
    expect(isTerminalKanbanLane({ id: 7, name: "Qualificado" }, 20)).toBe(false);
  });
});
