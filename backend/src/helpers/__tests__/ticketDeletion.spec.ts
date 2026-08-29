import {
  isCompanyAdmin,
  TICKET_DELETION_CATEGORIES,
  TICKET_DELETION_REASON_MAX,
  TICKET_DELETION_REASON_MIN,
  assertDeletionPayload,
  ticketDeletionRagSource
} from "../ticketDeletion";
import AppError from "../../errors/AppError";

describe("ticketDeletion", () => {
  it("reconhece admin, super e flag super", () => {
    expect(isCompanyAdmin({ profile: "admin" })).toBe(true);
    expect(isCompanyAdmin({ profile: "super" })).toBe(true);
    expect(isCompanyAdmin({ profile: "user", super: true })).toBe(true);
    expect(isCompanyAdmin({ profile: "user" })).toBe(false);
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
    expect(() => assertDeletionPayload("x", "motivo com quinze!"))
      .toThrow(AppError);
    expect(() => assertDeletionPayload("teste", "curto"))
      .toThrow(AppError);
    expect(() =>
      assertDeletionPayload("teste", "a".repeat(TICKET_DELETION_REASON_MAX + 1))
    ).toThrow(AppError);
    expect(TICKET_DELETION_REASON_MIN).toBe(15);
  });

  it("monta source do RAG", () => {
    expect(ticketDeletionRagSource(19)).toBe("ticket:19");
  });
});
