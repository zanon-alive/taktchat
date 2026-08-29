jest.mock("../../../models/Ticket", () => ({
  __esModule: true,
  default: { unscoped: jest.fn() }
}));
jest.mock("../../../models/User", () => ({
  __esModule: true,
  default: { findByPk: jest.fn() }
}));
jest.mock("../../../models/KnowledgeDocument", () => ({
  __esModule: true,
  default: { findAll: jest.fn().mockResolvedValue([]), destroy: jest.fn() }
}));
jest.mock("../../../models/KnowledgeChunk", () => ({
  __esModule: true,
  default: { destroy: jest.fn() }
}));
jest.mock("../../../utils/logger", () => ({
  __esModule: true,
  default: { error: jest.fn() }
}));

import Ticket from "../../../models/Ticket";
import User from "../../../models/User";
import DeleteTicketService from "../DeleteTicketService";
import AppError from "../../../errors/AppError";

describe("DeleteTicketService", () => {
  const unscopedFind = jest.fn();
  const update = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (Ticket.unscoped as jest.Mock).mockReturnValue({ findOne: unscopedFind });
    (User.findByPk as jest.Mock).mockResolvedValue({ id: 1, name: "Admin" });
  });

  const base = {
    id: "19",
    userId: 1,
    companyId: 1,
    profile: "admin",
    category: "duplicado",
    reason: "Ticket aberto duas vezes na mesma fila"
  };

  it("recusa quem não é admin", async () => {
    await expect(
      DeleteTicketService({ ...base, profile: "user" })
    ).rejects.toMatchObject({ message: "ERR_NO_PERMISSION", statusCode: 403 });
    expect(unscopedFind).not.toHaveBeenCalled();
  });

  it("recusa motivo curto", async () => {
    await expect(
      DeleteTicketService({ ...base, reason: "ok" })
    ).rejects.toBeInstanceOf(AppError);
  });

  it("atualiza em vez de destroy", async () => {
    unscopedFind.mockResolvedValue({
      id: 19,
      deletedAt: null,
      update
    });

    await DeleteTicketService(base);

    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        deletedBy: 1,
        deletedByName: "Admin",
        deletionReasonCategory: "duplicado"
      })
    );
    expect(update.mock.calls[0][0].deletedAt).toBeInstanceOf(Date);
  });

  it("recusa ticket já oculto", async () => {
    unscopedFind.mockResolvedValue({
      id: 19,
      deletedAt: new Date(),
      update
    });
    await expect(DeleteTicketService(base)).rejects.toMatchObject({
      message: "ERR_TICKET_ALREADY_DELETED",
      statusCode: 409
    });
    expect(update).not.toHaveBeenCalled();
  });
});
