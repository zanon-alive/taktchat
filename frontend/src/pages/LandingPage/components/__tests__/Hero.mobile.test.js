import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { StylesProvider, createGenerateClassName } from "@mui/styles";

jest.mock("@mui/material", () => {
  const actual = jest.requireActual("@mui/material");
  return {
    ...actual,
    useMediaQuery: () => true,
  };
});

jest.mock("../../../landing-shared/useSupportWhatsApp", () => ({
  __esModule: true,
  default: () => ({
    number: "5514999990000",
    ready: true,
    url: "https://wa.me/5514999990000?text=teste",
  }),
}));

import Hero from "../Hero";

const theme = createTheme();
const generateClassName = createGenerateClassName({ disableGlobal: true, productionPrefix: "herom" });

describe("Hero da landing no tablet/mobile", () => {
  it("deixa o WhatsApp só no FAB abaixo de md", () => {
    render(
      <StylesProvider generateClassName={generateClassName}>
        <ThemeProvider theme={theme}>
          <MemoryRouter>
            <Hero />
          </MemoryRouter>
        </ThemeProvider>
      </StylesProvider>
    );

    expect(screen.queryByRole("link", { name: "Falar no WhatsApp" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Ver em 1 min" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Começar agora" })).toBeInTheDocument();
  });
});
