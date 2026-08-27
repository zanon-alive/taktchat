import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route } from "react-router-dom";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { StylesProvider, createGenerateClassName } from "@mui/styles";

jest.mock("@mui/material", () => {
  const actual = jest.requireActual("@mui/material");
  return {
    ...actual,
    useMediaQuery: () => false,
  };
});

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
  it("abre no primeiro slide e expõe Voltar para a landing e Login", () => {
    renderTour();
    expect(screen.getByRole("heading", { name: "O WhatsApp da empresa, fora do celular" })).toBeInTheDocument();
    expect(screen.getByText(/Para quem já vive de WhatsApp/)).toBeInTheDocument();
    expect(screen.getByText(/O cliente não muda de app/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Voltar" })).toHaveAttribute("href", "/landing");
    expect(screen.getByRole("link", { name: "TaktChat — ir para a landing" })).toHaveAttribute("href", "/landing");
    expect(screen.getByRole("link", { name: "Planos" })).toHaveAttribute("href", "/landing#planos");
    expect(screen.getByRole("link", { name: "FAQ" })).toHaveAttribute("href", "/landing#faq");
    expect(screen.getByRole("link", { name: "Login" })).toHaveAttribute("href", "/login");
    expect(screen.getByText("1 / 5 · ±1 min")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Falar com especialista" })).not.toBeInTheDocument();
  });

  it("abre o slide da fila via ?s=3", () => {
    renderTour("/tour?s=3");
    expect(screen.getByRole("heading", { name: "A mesa do time" })).toBeInTheDocument();
  });

  it("no último slide mostra o CTA de especialista e avança para a landing", () => {
    renderTour("/tour?s=5");
    const cta = screen.getByRole("link", { name: "Falar com especialista" });
    expect(cta).toHaveAttribute("href", "/landing#lead-form");
    expect(screen.getByLabelText("Ir para a landing")).toHaveAttribute("href", "/landing");
    fireEvent.click(screen.getByLabelText("Slide anterior"));
    expect(screen.queryByRole("link", { name: "Falar com especialista" })).not.toBeInTheDocument();
    expect(screen.getByLabelText("Próximo slide")).toBeInTheDocument();
  });

  it("no último slide a seta direita envia para a landing", () => {
    render(
      <StylesProvider generateClassName={generateClassName}>
        <ThemeProvider theme={theme}>
          <MemoryRouter initialEntries={["/tour?s=5"]}>
            <Route path="/tour" component={PublicTour} />
            <Route path="/landing" render={() => <div>Página da landing</div>} />
          </MemoryRouter>
        </ThemeProvider>
      </StylesProvider>
    );

    window.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
    expect(screen.getByText("Página da landing")).toBeInTheDocument();
  });

  it("Esc envia de volta para a landing", () => {
    render(
      <StylesProvider generateClassName={generateClassName}>
        <ThemeProvider theme={theme}>
          <MemoryRouter initialEntries={["/tour"]}>
            <Route path="/tour" component={PublicTour} />
            <Route path="/landing" render={() => <div>Página da landing</div>} />
          </MemoryRouter>
        </ThemeProvider>
      </StylesProvider>
    );

    window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    expect(screen.getByText("Página da landing")).toBeInTheDocument();
  });
});
