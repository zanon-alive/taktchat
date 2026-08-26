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
const generateClassName = createGenerateClassName({ disableGlobal: true, productionPrefix: "nav" });

describe("LandingNav", () => {
  it("expõe o link de Login para /login", () => {
    render(
      <StylesProvider generateClassName={generateClassName}>
        <ThemeProvider theme={theme}>
          <MemoryRouter>
            <LandingNav />
          </MemoryRouter>
        </ThemeProvider>
      </StylesProvider>
    );

    const login = screen.getByRole("link", { name: "Login" });
    expect(login).toHaveAttribute("href", "/login");
  });
});
