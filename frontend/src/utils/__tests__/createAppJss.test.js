import { createAppJss, isVendorPrefixerPlugin } from "../createAppJss";

describe("isVendorPrefixerPlugin", () => {
  it("reconhece o plugin com os tres hooks do vendor prefixer", () => {
    expect(
      isVendorPrefixerPlugin({
        onProcessRule: () => {},
        onProcessStyle: () => {},
        onChangeValue: () => {},
      })
    ).toBe(true);
  });

  it("ignora plugins do preset que nao sao o prefixer", () => {
    expect(isVendorPrefixerPlugin({ onProcessStyle: () => {}, onChangeValue: () => {} })).toBe(false);
    expect(isVendorPrefixerPlugin({ onProcessRule: () => {}, onProcessStyle: () => {} })).toBe(false);
    expect(isVendorPrefixerPlugin(null)).toBe(false);
  });
});

describe("createAppJss", () => {
  it("monta JSS sem o vendor prefixer", () => {
    const jss = createAppJss();
    const prefixerAindaPresente = jss.plugins.plugins.external.some(isVendorPrefixerPlugin);
    expect(prefixerAindaPresente).toBe(false);
    expect(jss.plugins.plugins.external.every(Boolean)).toBe(true);
  });
});
