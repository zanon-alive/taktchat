import { hitRateLimit, RateLimitStore } from "../rateLimit";

describe("hitRateLimit", () => {
  it("permite até o máximo e bloqueia o seguinte na janela", () => {
    const store: RateLimitStore = {};
    const now = 1_000_000;
    for (let i = 0; i < 20; i++) {
      expect(hitRateLimit(store, "user:1", 20, 15 * 60 * 1000, now)).toBe(true);
    }
    expect(hitRateLimit(store, "user:1", 20, 15 * 60 * 1000, now)).toBe(false);
  });

  it("isola chave por userId", () => {
    const store: RateLimitStore = {};
    const now = 1_000_000;
    expect(hitRateLimit(store, "user:1", 1, 1000, now)).toBe(true);
    expect(hitRateLimit(store, "user:1", 1, 1000, now)).toBe(false);
    expect(hitRateLimit(store, "user:2", 1, 1000, now)).toBe(true);
  });
});
