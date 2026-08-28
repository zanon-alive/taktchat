import { applyColorScheme } from "../applyColorScheme";

describe("applyColorScheme", () => {
  afterEach(() => {
    document.documentElement.classList.remove("dark");
    document.documentElement.style.removeProperty("color-scheme");
  });

  it("liga a classe dark no html no tema escuro", () => {
    applyColorScheme("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(document.documentElement.style.colorScheme).toBe("dark");
  });

  it("remove a classe dark no tema claro", () => {
    document.documentElement.classList.add("dark");
    applyColorScheme("light");
    expect(document.documentElement.classList.contains("dark")).toBe(false);
    expect(document.documentElement.style.colorScheme).toBe("light");
  });
});
