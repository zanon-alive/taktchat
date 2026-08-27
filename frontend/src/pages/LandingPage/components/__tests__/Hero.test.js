import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { StylesProvider, createGenerateClassName } from "@mui/styles";
import Hero from "../Hero";

const theme = createTheme();
const generateClassName = createGenerateClassName({ disableGlobal: true, productionPrefix: "hero" });

describe("Hero da landing", () => {
  it("expõe WhatsApp, o tour e Começar agora sem depender do tema primary", () => {
    render(
      <StylesProvider generateClassName={generateClassName}>
        <ThemeProvider theme={theme}>
          <MemoryRouter>
            <Hero />
          </MemoryRouter>
        </ThemeProvider>
      </StylesProvider>
    );

    expect(screen.getByRole("button", { name: "Começar agora" })).toBeVisible();
    expect(screen.getByRole("link", { name: "Ver em 1 min" })).toHaveAttribute("href", "/tour");
    expect(screen.getByRole("link", { name: "Falar no WhatsApp" })).toHaveAttribute(
      "href",
      expect.stringMatching(/^https:\/\/wa\.me\/\d+\?text=/)
    );
  });
});
