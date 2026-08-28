import { shouldSuppressBaileysSessionLog } from "../suppressBaileysDecryptLogs";

describe("shouldSuppressBaileysSessionLog", () => {
  it("filtra dump de prekey stale", () => {
    expect(
      shouldSuppressBaileysSessionLog([
        "Closing stale open session for new outgoing prekey bundle"
      ])
    ).toBe(true);
  });

  it("filtra SessionEntry", () => {
    expect(shouldSuppressBaileysSessionLog(["Closing session: SessionEntry {"])).toBe(
      true
    );
  });

  it("não filtra log operacional", () => {
    expect(
      shouldSuppressBaileysSessionLog(["[flow] Enviando imagem do Conteúdo"])
    ).toBe(false);
  });
});
