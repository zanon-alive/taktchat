import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route } from "react-router-dom";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { StylesProvider, createGenerateClassName } from "@mui/styles";
import PublicTour from "../index";

const theme = createTheme();
const generateClassName = createGenerateClassName({ disableGlobal: true, productionPrefix: "tour" });

const renderTour = (initial = "/tour") =>
  render(
    <StylesProvider generateClassName={generateClassName}>
      <ThemeProvider theme={theme}>
        <MemoryRouter initialEntries={[initial]}>
          <Route path="/tour" component={PublicTour} />
        </MemoryRouter>
      </ThemeProvider>
    </StylesProvider>
  );

describe("PublicTour", () => {
  it("abre no primeiro slide e expõe Login no header", () => {
    renderTour();
    expect(screen.getByRole("heading", { name: "O WhatsApp da empresa, fora do celular" })).toBeInTheDocument();
    expect(screen.getByText(/Para quem já vive de WhatsApp/)).toBeInTheDocument();
    expect(screen.getByText(/O cliente não muda de app/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Login" })).toHaveAttribute("href", "/login");
    expect(screen.getByText("1 / 5 · ±1 min")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Falar com especialista" })).not.toBeInTheDocument();
  });

  it("abre o slide da fila via ?s=3", () => {
    renderTour("/tour?s=3");
    expect(screen.getByRole("heading", { name: "A mesa do time" })).toBeInTheDocument();
  });

  it("no último slide mostra só o CTA de especialista", () => {
    renderTour("/tour?s=5");
    const cta = screen.getByRole("link", { name: "Falar com especialista" });
    expect(cta).toHaveAttribute("href", "/landing#lead-form");
    fireEvent.click(screen.getByLabelText("Slide anterior"));
    expect(screen.queryByRole("link", { name: "Falar com especialista" })).not.toBeInTheDocument();
  });
});
