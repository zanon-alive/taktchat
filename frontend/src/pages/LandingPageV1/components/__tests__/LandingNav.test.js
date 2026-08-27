import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { StylesProvider, createGenerateClassName } from "@mui/styles";

jest.mock("@mui/material", () => {
  const actual = jest.requireActual("@mui/material");
  return {
    ...actual,
    useMediaQuery: () => false,
  };
});

import LandingNav from "../LandingNav";

const theme = createTheme();
const generateClassName = createGenerateClassName({ disableGlobal: true, productionPrefix: "navv1" });

describe("LandingNav v1", () => {
  it("expõe o menu e o Login no topo, sem depender de scroll", () => {
    render(
      <StylesProvider generateClassName={generateClassName}>
        <ThemeProvider theme={theme}>
          <MemoryRouter>
            <LandingNav />
          </MemoryRouter>
        </ThemeProvider>
      </StylesProvider>
    );

    expect(screen.getByRole("button", { name: "Funcionalidades" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Planos" })).toBeVisible();
    expect(screen.getByRole("button", { name: "FAQ" })).toBeVisible();
    expect(screen.getByRole("link", { name: "Login" })).toHaveAttribute("href", "/login");
  });
});
