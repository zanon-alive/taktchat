import { compile, middleware, serialize, stringify, prefixer } from "stylis";
import { dropMsCssSelectors } from "../dropMsCssSelectors";

describe("dropMsCssSelectors", () => {
  it("anula regra so com seletor -ms-", () => {
    const element = {
      type: "rule",
      props: [".x:-ms-input-placeholder"],
      children: "color:red;",
      value: ".x:-ms-input-placeholder",
    };

    dropMsCssSelectors(element);

    expect(element.type).toBe("");
    expect(element.return).toBe("");
    expect(element.props).toEqual([]);
  });

  it("mantem seletores sem -ms-", () => {
    const element = {
      type: "rule",
      props: [".x::-moz-placeholder"],
      children: "color:red;",
    };

    dropMsCssSelectors(element);

    expect(element.props).toEqual([".x::-moz-placeholder"]);
  });

  it("filtra so os -ms- numa lista mista", () => {
    const element = {
      type: "rule",
      props: [
        ".x::-moz-placeholder",
        ".x:-ms-input-placeholder",
        ".x::-ms-input-placeholder",
      ],
    };

    dropMsCssSelectors(element);

    expect(element.props).toEqual([".x::-moz-placeholder"]);
  });

  it("com prefixer + stringify, o CSS final nao tem -ms-input-placeholder", () => {
    const css = serialize(
      compile(
        ".x::-moz-placeholder{color:red}.x:-ms-input-placeholder{color:red}.x::placeholder{opacity:.5}"
      ),
      middleware([prefixer, dropMsCssSelectors, stringify])
    );

    expect(css).not.toMatch(/-ms-input-placeholder/);
    expect(css).toMatch(/::-moz-placeholder/);
  });
});
