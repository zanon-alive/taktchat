import {
  isCompanyAdmin,
  canViewDeletedTickets,
  TICKET_DELETION_CATEGORIES,
  TICKET_DELETION_REASON_MAX,
  TICKET_DELETION_REASON_MIN,
  TICKET_HIDE_BURST_LIMIT,
  assertDeletionPayload,
  getTicketDeletionMeta,
  sqlNotDeleted,
  ticketDeletionRagSource
} from "../ticketDeletion";
import AppError from "../../errors/AppError";
import fs from "fs";
import path from "path";

describe("ticketDeletion", () => {
  it("reconhece admin, super e flag super", () => {
    expect(isCompanyAdmin({ profile: "admin" })).toBe(true);
    expect(isCompanyAdmin({ profile: "super" })).toBe(true);
    expect(isCompanyAdmin({ profile: "user", super: true })).toBe(true);
    expect(isCompanyAdmin({ profile: "user" })).toBe(false);
  });

  it("viewDeleted: admin ou permissão explícita", () => {
    expect(canViewDeletedTickets({ profile: "admin" })).toBe(true);
    expect(
      canViewDeletedTickets({
        profile: "user",
        permissions: ["tickets.viewDeleted"]
      })
    ).toBe(true);
    expect(canViewDeletedTickets({ profile: "user", permissions: ["tickets.view"] })).toBe(
      false
    );
  });

  it("aceita categoria e motivo válidos", () => {
    const payload = assertDeletionPayload(
      "duplicado",
      "Ticket aberto em duplicidade na fila de suporte"
    );
    expect(payload.category).toBe("duplicado");
    expect(TICKET_DELETION_CATEGORIES).toContain(payload.category);
  });

  it("recusa categoria inválida e motivo curto ou longo demais", () => {
    expect(() => assertDeletionPayload("x", "motivo com quinze!")).toThrow(AppError);
    expect(() => assertDeletionPayload("teste", "curto")).toThrow(AppError);
    expect(() =>
      assertDeletionPayload("teste", "a".repeat(TICKET_DELETION_REASON_MAX + 1))
    ).toThrow(AppError);
    expect(TICKET_DELETION_REASON_MIN).toBe(15);
  });

  it("monta source do RAG", () => {
    expect(ticketDeletionRagSource(19)).toBe("ticket:19");
  });

  it("sqlNotDeleted usa alias seguro", () => {
    expect(sqlNotDeleted()).toBe('AND t."deletedAt" IS NULL');
    expect(sqlNotDeleted("tc")).toBe('AND tc."deletedAt" IS NULL');
    expect(sqlNotDeleted("t; drop")).toBe('AND t."deletedAt" IS NULL');
  });

  it("meta expõe categorias e limites", () => {
    const meta = getTicketDeletionMeta();
    expect(meta.categories).toEqual([...TICKET_DELETION_CATEGORIES]);
    expect(meta.reasonMin).toBe(15);
    expect(meta.reasonMax).toBe(500);
  });

  it("E1: serviços de estatística usam sqlNotDeleted", () => {
    const files = [
      "services/Statistics/DashTicketsAndTimes.ts",
      "services/Statistics/DashTicketsQueue.ts",
      "services/Statistics/DashTicketsChannels.ts",
      "services/Statistics/DashTicketsEvolutionByPeriod.ts",
      "services/Statistics/DashTicketsEvolutionChannels.ts",
      "services/Statistics/DashTicketsPerUsersDetail.ts",
      "services/Statistics/StatisticsPerUsers.ts",
      "services/TicketServices/ListTicketsServiceReport.ts",
      "services/ReportService/DashbardDataService.ts"
    ];
    const root = path.join(__dirname, "../..");
    files.forEach(rel => {
      const src = fs.readFileSync(path.join(root, rel), "utf8");
      expect(src).toContain("sqlNotDeleted");
    });
  });

  it("burst limit é 10", () => {
    expect(TICKET_HIDE_BURST_LIMIT).toBe(10);
  });
});
