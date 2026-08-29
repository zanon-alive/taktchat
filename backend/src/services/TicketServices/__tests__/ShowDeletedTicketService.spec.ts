jest.mock("../../../models/Ticket", () => ({
  __esModule: true,
  default: { unscoped: jest.fn() }
}));
jest.mock("../../../models/Contact", () => ({ __esModule: true, default: {} }));
jest.mock("../../../models/User", () => ({ __esModule: true, default: {} }));
jest.mock("../../../models/Queue", () => ({ __esModule: true, default: {} }));
jest.mock("../../../models/Whatsapp", () => ({ __esModule: true, default: {} }));
jest.mock("../../../models/Message", () => ({
  __esModule: true,
  default: { findAndCountAll: jest.fn() }
}));
jest.mock("../../../models/TicketNote", () => ({
  __esModule: true,
  default: { findAll: jest.fn().mockResolvedValue([]) }
}));
jest.mock("../../../models/LogTicket", () => ({
  __esModule: true,
  default: { findAll: jest.fn().mockResolvedValue([]) }
}));

import Ticket from "../../../models/Ticket";
import Message from "../../../models/Message";
import ShowDeletedTicketService from "../ShowDeletedTicketService";
import AppError from "../../../errors/AppError";

describe("ShowDeletedTicketService", () => {
  const findOne = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (Ticket.unscoped as jest.Mock).mockReturnValue({ findOne });
  });

  it("pagina mensagens", async () => {
    findOne.mockResolvedValue({ id: 19, deletedAt: new Date(), companyId: 1 });
    (Message.findAndCountAll as jest.Mock).mockResolvedValue({
      count: 200,
      rows: [{ id: 1 }, { id: 2 }]
    });

    const data = await ShowDeletedTicketService("19", 1, "1", 50);

    expect(Message.findAndCountAll).toHaveBeenCalledWith(
      expect.objectContaining({
        limit: 50,
        offset: 0
      })
    );
    expect(data.hasMore).toBe(true);
    expect(data.count).toBe(200);
    expect(data.messages).toHaveLength(2);
  });

  it("404 se não está oculto", async () => {
    findOne.mockResolvedValue({ id: 19, deletedAt: null });
    await expect(ShowDeletedTicketService("19", 1)).rejects.toBeInstanceOf(AppError);
  });
});
