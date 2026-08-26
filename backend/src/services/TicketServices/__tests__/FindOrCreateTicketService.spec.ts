jest.mock("../../../libs/socket", () => ({
  getIO: jest.fn(() => ({ emit: jest.fn() }))
}));

jest.mock("../../../utils/logger", () => ({
  __esModule: true,
  default: { error: jest.fn(), info: jest.fn(), warn: jest.fn() }
}));

jest.mock("../../../models/Ticket", () => ({
  __esModule: true,
  default: { findOne: jest.fn(), create: jest.fn() }
}));

jest.mock("../../../models/Contact", () => ({
  __esModule: true,
  default: { update: jest.fn().mockResolvedValue([1]) }
}));

jest.mock("../../../models/Whatsapp", () => ({
  __esModule: true,
  default: { findByPk: jest.fn() }
}));

jest.mock("../../CompaniesSettings/EnsureCompanySettingsService", () => ({
  __esModule: true,
  default: jest.fn(),
  resolveCompanySettings: jest.fn()
}));

jest.mock("../ShowTicketService", () => ({
  __esModule: true,
  default: jest.fn()
}));

jest.mock("../FindOrCreateATicketTrakingService", () => ({
  __esModule: true,
  default: jest.fn()
}));

jest.mock("../CreateLogTicketService", () => ({
  __esModule: true,
  default: jest.fn()
}));

jest.mock("../UpdateTicketService", () => ({
  __esModule: true,
  default: jest.fn()
}));

jest.mock("../../../helpers/kanbanTicketTags", () => ({
  applyDefaultKanbanLane: jest.fn()
}));

import Ticket from "../../../models/Ticket";
import Contact from "../../../models/Contact";
import { resolveCompanySettings } from "../../CompaniesSettings/EnsureCompanySettingsService";
import ShowTicketService from "../ShowTicketService";
import FindOrCreateTicketService from "../FindOrCreateTicketService";

describe("FindOrCreateTicketService sem CompaniesSettings", () => {
  const contact = { id: 5, isGroup: false } as any;
  const whatsapp = { id: 9, timeCreateNewTicket: 0, channel: "whatsapp" } as any;
  const existingTicket = {
    id: 10,
    userId: null,
    queueId: null,
    isGroup: false,
    update: jest.fn().mockResolvedValue(undefined)
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (resolveCompanySettings as jest.Mock).mockResolvedValue({
      enableLGPD: "disabled",
      DirectTicketsToWallets: false,
      lgpdMessage: "",
      lgpdConsent: "disabled"
    });
    (Ticket.findOne as jest.Mock).mockResolvedValue(existingTicket);
    (ShowTicketService as jest.Mock).mockResolvedValue({
      ...existingTicket,
      user: null,
      queue: null
    });
  });

  it("não quebra quando settings não é passado e resolve os defaults", async () => {
    const ticket = await FindOrCreateTicketService(
      contact,
      whatsapp,
      0,
      1,
      null,
      null,
      null,
      "whatsapp"
    );

    expect(resolveCompanySettings).toHaveBeenCalledWith(1, undefined);
    expect(ticket.id).toBe(10);
    expect(Contact.update).toHaveBeenCalled();
  });

  it("reaproveita settings já carregados pelo caller", async () => {
    const settings = { enableLGPD: "enabled", DirectTicketsToWallets: false };

    await FindOrCreateTicketService(
      contact,
      whatsapp,
      0,
      1,
      null,
      null,
      null,
      "whatsapp",
      false,
      false,
      settings
    );

    expect(resolveCompanySettings).toHaveBeenCalledWith(1, settings);
  });
});
