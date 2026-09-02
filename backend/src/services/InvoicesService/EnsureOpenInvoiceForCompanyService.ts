import Invoices from "../../models/Invoices";
import Plan from "../../models/Plan";
import Company from "../../models/Company";

export function toDateOnlyUtcString(d: Date): string {
  return d.toISOString().slice(0, 10);
}

const EnsureOpenInvoiceForCompanyService = async (
  companyId: number,
  dueDate: Date
): Promise<Invoices> => {
  const due = toDateOnlyUtcString(dueDate);
  const existing = await Invoices.findOne({
    where: { companyId, dueDate: due }
  });
  if (existing) {
    return existing;
  }

  const company = await Company.findByPk(companyId);
  const plan = company?.planId ? await Plan.findByPk(company.planId) : null;
  const value = parseFloat(String(plan?.amount ?? "0")) || 0;

  return Invoices.create({
    companyId,
    dueDate: due,
    detail: plan?.name ? `Assinatura ${plan.name}` : "Assinatura",
    status: "open",
    value
  });
};

export default EnsureOpenInvoiceForCompanyService;
