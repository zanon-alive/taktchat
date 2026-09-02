import EnsureOpenInvoiceForCompanyService, {
  toDateOnlyUtcString
} from "../EnsureOpenInvoiceForCompanyService";
import Invoices from "../../../models/Invoices";
import Plan from "../../../models/Plan";
import Company from "../../../models/Company";

jest.mock("../../../models/Invoices", () => ({
  __esModule: true,
  default: { findOne: jest.fn(), create: jest.fn() }
}));
jest.mock("../../../models/Plan", () => ({
  __esModule: true,
  default: { findByPk: jest.fn() }
}));
jest.mock("../../../models/Company", () => ({
  __esModule: true,
  default: { findByPk: jest.fn() }
}));

describe("EnsureOpenInvoiceForCompanyService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("não duplica fatura com o mesmo vencimento", async () => {
    (Invoices.findOne as jest.Mock).mockResolvedValue({ id: 1, companyId: 2 });

    const result = await EnsureOpenInvoiceForCompanyService(
      2,
      new Date("2026-09-15T00:00:00.000Z")
    );

    expect(result.id).toBe(1);
    expect(Invoices.create).not.toHaveBeenCalled();
  });

  it("cria fatura open com valor do plano", async () => {
    (Invoices.findOne as jest.Mock).mockResolvedValue(null);
    (Company.findByPk as jest.Mock).mockResolvedValue({ id: 2, planId: 9 });
    (Plan.findByPk as jest.Mock).mockResolvedValue({
      id: 9,
      name: "Starter",
      amount: "149.00"
    });
    (Invoices.create as jest.Mock).mockResolvedValue({ id: 3 });

    await EnsureOpenInvoiceForCompanyService(2, new Date("2026-09-15T00:00:00.000Z"));

    expect(Invoices.create).toHaveBeenCalledWith(
      expect.objectContaining({
        companyId: 2,
        dueDate: "2026-09-15",
        status: "open",
        value: 149,
        detail: "Assinatura Starter"
      })
    );
  });

  it("formata data só em UTC", () => {
    expect(toDateOnlyUtcString(new Date("2026-09-15T23:00:00.000Z"))).toBe(
      "2026-09-15"
    );
  });
});
