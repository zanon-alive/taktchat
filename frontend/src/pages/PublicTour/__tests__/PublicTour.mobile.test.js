import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route } from "react-router-dom";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { StylesProvider, createGenerateClassName } from "@mui/styles";

jest.mock("@mui/material", () => {
  const actual = jest.requireActual("@mui/material");
  return {
    ...actual,
    useMediaQuery: () => true,
  };
});

jest.mock("../../landing-shared/useSupportWhatsApp", () => ({
  __esModule: true,
  default: () => ({
    number: "5514999990000",
    ready: true,
    url: "https://wa.me/5514999990000?text=teste",
  }),
}));

import PublicTour from "../index";

const theme = createTheme();
const generateClassName = createGenerateClassName({ disableGlobal: true, productionPrefix: "tourm" });

describe("PublicTour no mobile", () => {
  it("mantém Voltar e Login no header e move Planos/FAQ para o rodapé", () => {
    render(
      <StylesProvider generateClassName={generateClassName}>
        <ThemeProvider theme={theme}>
          <MemoryRouter initialEntries={["/tour"]}>
            <Route path="/tour" component={PublicTour} />
          </MemoryRouter>
        </ThemeProvider>
      </StylesProvider>
    );

    expect(screen.getByRole("link", { name: "Voltar" })).toHaveAttribute("href", "/landing");
    expect(screen.getByRole("link", { name: "Login" })).toHaveAttribute("href", "/login");
    expect(screen.getByRole("link", { name: "Planos" })).toHaveAttribute("href", "/landing#planos");
    expect(screen.getByRole("link", { name: "FAQ" })).toHaveAttribute("href", "/landing#faq");
  });
});
