import AppError from "../../errors/AppError";

const ISO_DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

export function parseIsoDateOnlyUtc(
  value?: string,
  fieldLabel = "Data"
): Date {
  if (!value || !ISO_DATE_ONLY.test(value)) {
    throw new AppError(
      `${fieldLabel} da licença é obrigatória (YYYY-MM-DD).`,
      400
    );
  }
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) {
    throw new AppError(`${fieldLabel} da licença inválida.`, 400);
  }
  return date;
}

export function parseLicensePeriod(
  planId?: number,
  licenseStartDate?: string,
  licenseEndDate?: string
): { planId: number; startDate: Date; endDate: Date; dueDate: string } {
  if (planId == null || Number.isNaN(Number(planId))) {
    throw new AppError("Plano é obrigatório.", 400);
  }
  const startDate = parseIsoDateOnlyUtc(
    licenseStartDate,
    "Data de início"
  );
  const endDate = parseIsoDateOnlyUtc(
    licenseEndDate,
    "Data de término"
  );
  if (endDate.getTime() < startDate.getTime()) {
    throw new AppError(
      "A data de término deve ser igual ou posterior à data de início.",
      400
    );
  }
  return {
    planId: Number(planId),
    startDate,
    endDate,
    dueDate: licenseEndDate as string
  };
}
