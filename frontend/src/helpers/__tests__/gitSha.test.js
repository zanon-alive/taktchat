import { formatBuildLabel, parseGithubPrNumber, shortGitSha } from "../gitSha";

describe("shortGitSha", () => {
  it("corta o SHA do GitHub em 7 caracteres", () => {
    expect(shortGitSha("ecaed27c825e9591876c64f0b71316688f5df02d")).toBe("ecaed27");
  });

  it("mantém dev e vazio", () => {
    expect(shortGitSha("dev")).toBe("dev");
    expect(shortGitSha("")).toBe("");
  });
});

describe("parseGithubPrNumber", () => {
  it("aceita número puro ou com #", () => {
    expect(parseGithubPrNumber("47")).toBe("47");
    expect(parseGithubPrNumber("#47")).toBe("47");
  });

  it("ignora vazio", () => {
    expect(parseGithubPrNumber("")).toBe("");
    expect(parseGithubPrNumber(undefined)).toBe("");
  });
});

describe("formatBuildLabel", () => {
  it("junta PR e SHA curto", () => {
    expect(formatBuildLabel("ecaed27c825e9591876c64f0b71316688f5df02d", "47")).toBe(
      "#47 · ecaed27"
    );
  });

  it("em dev não mostra PR", () => {
    expect(formatBuildLabel("dev", "47")).toBe("dev");
  });

  it("sem PR mostra só o SHA", () => {
    expect(formatBuildLabel("ecaed27c825e9591876c64f0b71316688f5df02d", "")).toBe(
      "ecaed27"
    );
  });
});
