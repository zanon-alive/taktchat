jest.mock("../../../models/Ticket", () => ({
  __esModule: true,
  default: {
    findAndCountAll: jest.fn(),
    findAll: jest.fn()
  }
}));

jest.mock("../../../models/Contact", () => ({ __esModule: true, default: {} }));
jest.mock("../../../models/Message", () => ({ __esModule: true, default: {} }));
jest.mock("../../../models/Queue", () => ({ __esModule: true, default: {} }));
jest.mock("../../../models/User", () => ({ __esModule: true, default: {} }));
jest.mock("../../../models/Tag", () => ({
  __esModule: true,
  default: { findAll: jest.fn().mockResolvedValue([]) }
}));
jest.mock("../../../models/Whatsapp", () => ({ __esModule: true, default: {} }));
jest.mock("../../../models/ContactTag", () => ({
  __esModule: true,
  default: { findAll: jest.fn().mockResolvedValue([]) }
}));

jest.mock("../../UserServices/ShowUserService", () => ({
  __esModule: true,
  default: jest.fn()
}));

jest.mock("../../CompaniesSettings/EnsureCompanySettingsService", () => ({
  __esModule: true,
  default: jest.fn()
}));

jest.mock("../../CompaniesSettings/FindCompanySettingOneService", () => ({
  __esModule: true,
  default: jest.fn()
}));

import Ticket from "../../../models/Ticket";
import ShowUserService from "../../UserServices/ShowUserService";
import EnsureCompanySettingsService from "../../CompaniesSettings/EnsureCompanySettingsService";
import FindCompanySettingOneService from "../../CompaniesSettings/FindCompanySettingOneService";
import ListTicketsService from "../ListTicketsService";

describe("ListTicketsService sem CompaniesSettings", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (ShowUserService as jest.Mock).mockResolvedValue({
      id: 1,
      profile: "admin",
      allHistoric: "disabled",
      allTicket: "disable",
      allowGroup: false,
      allUserChat: "disabled",
      queues: []
    });
    (Ticket.findAndCountAll as jest.Mock).mockResolvedValue({
      count: 0,
      rows: []
    });
  });

  it("não quebra quando o setting não existe e devolve settingsCreated", async () => {
    (EnsureCompanySettingsService as jest.Mock).mockResolvedValue({
      settings: { companyId: 1 },
      created: true
    });
    (FindCompanySettingOneService as jest.Mock).mockResolvedValue([]);

    const result = await ListTicketsService({
      userId: 1,
      companyId: 1,
      queueIds: [],
      tags: [],
      users: []
    });

    expect(result.settingsCreated).toBe(true);
    expect(result.tickets).toEqual([]);
    expect(result.count).toBe(0);
    expect(FindCompanySettingOneService).toHaveBeenCalledWith({
      companyId: 1,
      column: "showNotificationPending"
    });
  });

  it("trata array vazio de showNotificationPending como false", async () => {
    (EnsureCompanySettingsService as jest.Mock).mockResolvedValue({
      settings: { companyId: 1 },
      created: false
    });
    (FindCompanySettingOneService as jest.Mock).mockResolvedValue([]);

    await expect(
      ListTicketsService({
        userId: 1,
        companyId: 1,
        queueIds: [],
        tags: [],
        users: []
      })
    ).resolves.toMatchObject({ hasMore: false, settingsCreated: false });
  });
});
