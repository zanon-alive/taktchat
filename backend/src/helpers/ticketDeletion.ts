import AppError from "../errors/AppError";

export const TICKET_DELETION_CATEGORIES = [
  "duplicado",
  "teste",
  "erro_abertura",
  "contato_pediu",
  "lgpd",
  "outro"
] as const;

export type TicketDeletionCategory = typeof TICKET_DELETION_CATEGORIES[number];

export const TICKET_DELETION_REASON_MIN = 15;
export const TICKET_DELETION_REASON_MAX = 500;

export const notDeletedWhere = { deletedAt: null };

export const isCompanyAdmin = (user: {
  profile?: string;
  super?: boolean;
}): boolean => {
  return (
    user?.profile === "admin" ||
    user?.profile === "super" ||
    user?.super === true
  );
};

export const ticketDeletionRagSource = (ticketId: string | number): string =>
  `ticket:${ticketId}`;

export const normalizeDeletionReason = (reason: unknown): string =>
  String(reason ?? "").trim();

export const assertDeletionPayload = (
  category: unknown,
  reason: unknown
): { category: TicketDeletionCategory; reason: string } => {
  const cat = String(category ?? "").trim();
  const text = normalizeDeletionReason(reason);

  if (!TICKET_DELETION_CATEGORIES.includes(cat as TicketDeletionCategory)) {
    throw new AppError("ERR_TICKET_DELETE_REASON", 400);
  }

  if (
    text.length < TICKET_DELETION_REASON_MIN ||
    text.length > TICKET_DELETION_REASON_MAX
  ) {
    throw new AppError("ERR_TICKET_DELETE_REASON", 400);
  }

  return { category: cat as TicketDeletionCategory, reason: text };
};
