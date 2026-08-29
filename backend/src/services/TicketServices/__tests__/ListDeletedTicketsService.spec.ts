jest.mock("../../../models/Ticket", () => ({
  __esModule: true,
  default: { unscoped: jest.fn() }
}));
jest.mock("../../../models/Contact", () => ({ __esModule: true, default: {} }));
jest.mock("../../../models/User", () => ({ __esModule: true, default: {} }));
jest.mock("../../../models/Queue", () => ({ __esModule: true, default: {} }));
jest.mock("../../../models/Whatsapp", () => ({ __esModule: true, default: {} }));

import Ticket from "../../../models/Ticket";
import ListDeletedTicketsService from "../ListDeletedTicketsService";

describe("ListDeletedTicketsService", () => {
  const findAndCountAll = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (Ticket.unscoped as jest.Mock).mockReturnValue({ findAndCountAll });
    findAndCountAll.mockResolvedValue({ count: 1, rows: [{ id: 7 }] });
  });

  it("filtra por deletedBy", async () => {
    await ListDeletedTicketsService({
      companyId: 1,
      deletedBy: 42
    });

    expect(findAndCountAll).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          companyId: 1,
          deletedBy: 42
        })
      })
    );
  });
});
