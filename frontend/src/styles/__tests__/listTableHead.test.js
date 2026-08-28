import { listTableHead, legacyListRowSx } from "../listTableHead";

const light = {
  spacing: (n) => `${n * 8}px`,
  palette: {
    mode: "light",
    action: { hover: "rgba(0,0,0,0.04)" },
    background: { paper: "#fff" },
    text: { primary: "rgba(0,0,0,0.87)" },
    divider: "rgba(0,0,0,0.12)",
    primary: { main: "#065183" },
  },
};

const dark = {
  ...light,
  palette: {
    ...light.palette,
    mode: "dark",
    background: { paper: "#121212" },
    text: { primary: "#fff" },
  },
};

describe("listTableHead", () => {
  it("no claro usa paper e texto primary", () => {
    const styles = listTableHead(light);
    expect(styles.backgroundColor).toBe("#fff");
    expect(styles["& th"].color).toBe("rgba(0,0,0,0.87)");
  });

  it("no escuro usa action.hover e texto primary", () => {
    const styles = listTableHead(dark);
    expect(styles.backgroundColor).toBe("rgba(0,0,0,0.04)");
    expect(styles["& th"].color).toBe("#fff");
  });
});

describe("legacyListRowSx", () => {
  it("usa paper e acento primary, sem fundo navy", () => {
    const sx = legacyListRowSx(light);
    expect(sx.backgroundColor).toBe("#fff");
    expect(sx.borderLeft).toContain("#065183");
  });
});
