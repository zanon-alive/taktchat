jest.mock("../../../models/Ticket", () => ({
  __esModule: true,
  default: { unscoped: jest.fn() }
}));
jest.mock("../../../models/Message", () => ({
  __esModule: true,
  default: { findAll: jest.fn(), destroy: jest.fn() }
}));
jest.mock("../../../models/Company", () => ({
  __esModule: true,
  default: { findAll: jest.fn() }
}));
jest.mock("../../../models/CompaniesSettings", () => ({
  __esModule: true,
  default: { findOne: jest.fn() }
}));
jest.mock("../../../utils/logger", () => ({
  __esModule: true,
  default: { info: jest.fn(), error: jest.fn() }
}));
jest.mock("fs", () => ({
  promises: { unlink: jest.fn().mockResolvedValue(undefined) }
}));

import Ticket from "../../../models/Ticket";
import Message from "../../../models/Message";
import { purgeHiddenTicketsForCompany } from "../PurgeHiddenTicketsService";

describe("PurgeHiddenTicketsService", () => {
  const findAll = jest.fn();
  const destroy = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (Ticket.unscoped as jest.Mock).mockReturnValue({ findAll });
    (Message.findAll as jest.Mock).mockResolvedValue([]);
    (Message.destroy as jest.Mock).mockResolvedValue(0);
    findAll.mockResolvedValue([]);
  });

  it("N=0 não apaga", async () => {
    const purged = await purgeHiddenTicketsForCompany(1, 0);
    expect(purged).toBe(0);
    expect(findAll).not.toHaveBeenCalled();
  });

  it("ticket oculto recente não entra no cutoff", async () => {
    const now = new Date("2026-08-29T12:00:00Z");
    findAll.mockResolvedValue([]);
    const purged = await purgeHiddenTicketsForCompany(1, 30, now);
    expect(findAll).toHaveBeenCalled();
    const where = findAll.mock.calls[0][0].where;
    expect(where.deletedAt).toBeDefined();
    expect(purged).toBe(0);
  });

  it("ticket oculto antigo é destruído", async () => {
    const now = new Date("2026-08-29T12:00:00Z");
    findAll.mockResolvedValue([
      { id: 9, companyId: 1, deletedAt: new Date("2026-01-01"), destroy }
    ]);
    const purged = await purgeHiddenTicketsForCompany(1, 30, now);
    expect(destroy).toHaveBeenCalled();
    expect(purged).toBe(1);
  });

  it("ticket não oculto nunca é selecionado (deletedAt obrigatório)", async () => {
    const now = new Date();
    await purgeHiddenTicketsForCompany(1, 7, now);
    const where = findAll.mock.calls[0][0].where;
    expect(where.deletedAt).toBeTruthy();
  });
});
