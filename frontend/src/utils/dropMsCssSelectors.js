/**
 * Descarta regras CSS com seletores IE/Edge legado (`:-ms-` / `::-ms-`).
 * O Firefox ignora esses seletores e loga aviso; o prefixer do Emotion ainda os gera.
 * Deve rodar DEPOIS do prefixer no `stylisPlugins`.
 */
export function dropMsCssSelectors(element) {
  if (!element || element.type !== "rule") {
    return;
  }

  const raw = element.props;
  const selectors = Array.isArray(raw) ? raw : raw ? [raw] : [];
  const kept = selectors.filter(
    (selector) =>
      typeof selector !== "string" ||
      (!selector.includes(":-ms-") && !selector.includes("::-ms-"))
  );

  if (kept.length === selectors.length) {
    return;
  }

  if (kept.length === 0) {
    element.type = "";
    element.value = "";
    element.return = "";
    element.children = "";
    element.props = [];
    return;
  }

  element.props = kept;
}
