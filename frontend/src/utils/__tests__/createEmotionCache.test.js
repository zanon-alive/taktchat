import { createEmotionCache } from "../createEmotionCache";

function collectedCss() {
  const fromTags = Array.from(document.querySelectorAll("style"))
    .map((node) => node.textContent || "")
    .join("\n");

  const fromSheets = Array.from(document.styleSheets)
    .map((sheet) => {
      try {
        return Array.from(sheet.cssRules || [])
          .map((rule) => rule.cssText)
          .join("\n");
      } catch (err) {
        return "";
      }
    })
    .join("\n");

  return `${fromTags}\n${fromSheets}`;
}

describe("createEmotionCache", () => {
  it("nao injeta -ms-input-placeholder no CSS gerado", () => {
    const cache = createEmotionCache();

    cache.insert(
      "",
      {
        name: "dropms",
        styles:
          ".x:-ms-input-placeholder{color:red}.x::-ms-input-placeholder{color:red}.x::-moz-placeholder{color:blue}",
      },
      cache.sheet,
      false
    );

    const css = collectedCss();

    expect(css).toMatch(/::-moz-placeholder/);
    expect(css).not.toMatch(/-ms-input-placeholder/);
  });
});
