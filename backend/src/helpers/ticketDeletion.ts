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

export const LGPD_REDACTED_BODY = "[conteúdo removido por LGPD]";

export const TICKET_HIDE_BURST_LIMIT = 10;
export const TICKET_HIDE_BURST_WINDOW_HOURS = 24;
export const TICKET_HIDE_BURST_WINDOW_MS =
  TICKET_HIDE_BURST_WINDOW_HOURS * 60 * 60 * 1000;

export const TICKET_HIDE_RATE_LIMIT = 20;
export const TICKET_HIDE_RATE_WINDOW_MS = 15 * 60 * 1000;

export const DELETED_MESSAGES_PAGE_SIZE = 50;
export const DELETED_MESSAGES_PAGE_MAX = 100;

export const DELETED_TICKETS_CSV_MAX = 5000;

export const notDeletedWhere = { deletedAt: null };

const SQL_ALIAS_RE = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

export const sqlNotDeleted = (alias = "t"): string => {
  const safe = SQL_ALIAS_RE.test(alias) ? alias : "t";
  return `AND ${safe}."deletedAt" IS NULL`;
};

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

export const canViewDeletedTickets = (user: {
  profile?: string;
  super?: boolean;
  permissions?: string[] | null;
} | null | undefined): boolean => {
  if (!user) return false;
  if (isCompanyAdmin(user)) return true;
  const perms = user.permissions;
  if (!Array.isArray(perms) || perms.length === 0) return false;
  if (perms.includes("tickets.viewDeleted")) return true;
  return perms.some(p => {
    if (p.endsWith(".*")) {
      const prefix = p.slice(0, -2);
      return "tickets.viewDeleted".startsWith(`${prefix}.`);
    }
    return false;
  });
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

export const getTicketDeletionMeta = () => ({
  categories: [...TICKET_DELETION_CATEGORIES],
  reasonMin: TICKET_DELETION_REASON_MIN,
  reasonMax: TICKET_DELETION_REASON_MAX
});
