import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
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

import LandingNav from "../LandingNav";

const theme = createTheme();
const generateClassName = createGenerateClassName({ disableGlobal: true, productionPrefix: "navm" });

describe("LandingNav no mobile", () => {
  it("abre o drawer com os itens do menu em texto visível", () => {
    render(
      <StylesProvider generateClassName={generateClassName}>
        <ThemeProvider theme={theme}>
          <MemoryRouter>
            <LandingNav />
          </MemoryRouter>
        </ThemeProvider>
      </StylesProvider>
    );

    fireEvent.click(screen.getByLabelText("Abrir menu"));
    expect(screen.getByText("Funcionalidades")).toBeVisible();
    expect(screen.getByRole("link", { name: "Tour" })).toHaveAttribute("href", "/tour");
    expect(screen.getByText("Planos")).toBeVisible();
    expect(screen.getByText("FAQ")).toBeVisible();
    expect(screen.getByRole("link", { name: "Login" })).toHaveAttribute("href", "/login");
    expect(screen.getByText("Começar")).toBeVisible();
  });
});
