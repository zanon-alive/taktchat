export function shouldShowTrialChip(signupEnabled, plan) {
  return Boolean(signupEnabled && plan && plan.trial);
}

export function getPlanCardCtaLabel(signupEnabled, isFeatured) {
  if (!signupEnabled) {
    return "Falar com especialista";
  }
  return isFeatured ? "Assinar Agora" : "Escolher este Plano";
}

export function getPlanTableCtaLabel(signupEnabled, isFeatured) {
  if (!signupEnabled) {
    return "Falar com especialista";
  }
  return isFeatured ? "Assinar" : "Escolher";
}
