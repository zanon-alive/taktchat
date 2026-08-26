import {
  getPlanCardCtaLabel,
  getPlanTableCtaLabel,
  shouldShowTrialChip,
} from "../planCta";

describe("planCta da landing", () => {
  it("esconde chip de trial quando o cadastro direto está desligado", () => {
    expect(shouldShowTrialChip(false, { trial: true, trialDays: 14 })).toBe(false);
    expect(shouldShowTrialChip(true, { trial: true })).toBe(true);
    expect(shouldShowTrialChip(true, { trial: false })).toBe(false);
  });

  it("usa contato quando o cadastro está desligado e trial quando ligado", () => {
    expect(getPlanCardCtaLabel(false, false)).toBe("Falar com especialista");
    expect(getPlanCardCtaLabel(true, false)).toBe("Escolher este Plano");
    expect(getPlanCardCtaLabel(true, true)).toBe("Assinar Agora");
    expect(getPlanTableCtaLabel(false, true)).toBe("Falar com especialista");
    expect(getPlanTableCtaLabel(true, true)).toBe("Assinar");
  });
});
