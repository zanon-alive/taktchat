import { hasFlowWebhookHash } from "../flowWebhookHash";

describe("hasFlowWebhookHash", () => {
  it("aceita hash preenchido", () => {
    expect(hasFlowWebhookHash("abc-123")).toBe(true);
  });

  it("rejeita vazio, nulo e placeholders", () => {
    expect(hasFlowWebhookHash(undefined)).toBe(false);
    expect(hasFlowWebhookHash(null)).toBe(false);
    expect(hasFlowWebhookHash("")).toBe(false);
    expect(hasFlowWebhookHash("   ")).toBe(false);
    expect(hasFlowWebhookHash("undefined")).toBe(false);
    expect(hasFlowWebhookHash("null")).toBe(false);
  });
});
