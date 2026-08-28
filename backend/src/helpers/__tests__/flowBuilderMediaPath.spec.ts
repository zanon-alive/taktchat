import fs from "fs";
import path from "path";
import {
  listFlowBuilderMediaRelPaths,
  resolveFlowBuilderMediaPath,
  toFlowBuilderPublicUrl
} from "../flowBuilderMediaPath";

jest.mock("fs", () => ({
  ...jest.requireActual("fs"),
  existsSync: jest.fn()
}));

const existsSync = fs.existsSync as jest.Mock;

describe("listFlowBuilderMediaRelPaths", () => {
  it("inclui flowbuilder e pasta da empresa", () => {
    const rels = listFlowBuilderMediaRelPaths("178_images.png", 5);
    expect(rels).toContain("flowbuilder/178_images.png");
    expect(rels).toContain("company5/178_images.png");
    expect(rels).toContain("178_images.png");
  });

  it("ignora nome vazio", () => {
    expect(listFlowBuilderMediaRelPaths("", 5)).toEqual([]);
  });
});

describe("resolveFlowBuilderMediaPath", () => {
  afterEach(() => {
    existsSync.mockReset();
  });

  it("devolve o primeiro candidato existente", () => {
    existsSync.mockImplementation((candidate: string) =>
      String(candidate).includes(`${path.sep}flowbuilder${path.sep}`)
    );
    const found = resolveFlowBuilderMediaPath("178_images.png", 5);
    expect(found).toContain(`${path.sep}flowbuilder${path.sep}178_images.png`);
  });

  it("retorna null se nenhum arquivo existir", () => {
    existsSync.mockReturnValue(false);
    expect(resolveFlowBuilderMediaPath("x.png", 5)).toBeNull();
  });
});

describe("toFlowBuilderPublicUrl", () => {
  afterEach(() => {
    existsSync.mockReset();
  });

  it("usa flowbuilder quando o arquivo existe lá", () => {
    existsSync.mockImplementation((candidate: string) =>
      String(candidate).includes(`${path.sep}flowbuilder${path.sep}`)
    );
    expect(
      toFlowBuilderPublicUrl("178_images.png", 5, "http://localhost:8090")
    ).toBe("http://localhost:8090/public/flowbuilder/178_images.png");
  });
});
