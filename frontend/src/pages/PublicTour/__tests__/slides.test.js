import { parseTourSlideParam, tourSearchForIndex, tourSlides } from "../slides";

describe("slides do tour público", () => {
  it("tem 5 slides e CTA só no último", () => {
    expect(tourSlides).toHaveLength(5);
    expect(tourSlides.filter((slide) => slide.ctaTo).map((slide) => slide.id)).toEqual(["ao-vivo"]);
    expect(tourSlides[0].audience).toMatch(/mais de uma pessoa no mesmo número/);
    expect(tourSlides[0].oneLiner).toMatch(/não muda de app/);
    expect(tourSlides.some((slide) => slide.image && slide.image.includes("kanban"))).toBe(false);
  });

  it("interpreta ?s= como índice 1-based limitado ao total", () => {
    expect(parseTourSlideParam("", 5)).toBe(0);
    expect(parseTourSlideParam("?s=3", 5)).toBe(2);
    expect(parseTourSlideParam("s=4", 5)).toBe(3);
    expect(parseTourSlideParam("?s=99", 5)).toBe(4);
    expect(parseTourSlideParam("?s=0", 5)).toBe(0);
    expect(tourSearchForIndex(0)).toBe("");
    expect(tourSearchForIndex(2)).toBe("?s=3");
  });
});
