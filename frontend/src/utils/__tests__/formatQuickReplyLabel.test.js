import { formatQuickReplyLabel } from "../formatQuickReplyLabel";

describe("formatQuickReplyLabel", () => {
  it("mostra só o atalho, sem duplicar a barra nem o corpo", () => {
    expect(formatQuickReplyLabel("aguardar")).toBe("/aguardar");
    expect(formatQuickReplyLabel("/aguardar")).toBe("/aguardar");
  });
});
