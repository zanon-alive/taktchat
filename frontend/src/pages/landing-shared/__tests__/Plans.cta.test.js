import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { StylesProvider, createGenerateClassName } from "@mui/styles";
import Plans from "../Plans";

jest.mock("../useSupportWhatsApp", () => ({
  __esModule: true,
  default: () => ({
    number: "5514999990000",
    ready: true,
    url: "https://wa.me/5514999990000?text=teste",
  }),
}));

const theme = createTheme();
const generateClassName = createGenerateClassName({ disableGlobal: true, productionPrefix: "plans" });

const plan = {
  id: 1,
  name: "Premium",
  amount: 99,
  users: 3,
  connections: 1,
  queues: 2,
  recurrence: "MENSAL",
};

const renderPlans = (signupEnabled) =>
  render(
    <StylesProvider generateClassName={generateClassName}>
      <ThemeProvider theme={theme}>
        <Plans plans={[plan]} signupEnabled={signupEnabled} />
      </ThemeProvider>
    </StylesProvider>
  );

describe("CTA dos planos", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("abre o WhatsApp quando o cadastro direto está desligado", () => {
    const open = jest.spyOn(window, "open").mockImplementation(() => null);
    renderPlans(false);
    fireEvent.click(screen.getByRole("button", { name: "Falar com especialista" }));
    expect(open).toHaveBeenCalledWith(
      expect.stringMatching(/^https:\/\/wa\.me\/\d+\?text=/),
      "_blank",
      "noopener,noreferrer"
    );
  });

  it("rola para o formulário quando o cadastro direto está ligado", () => {
    const form = document.createElement("div");
    form.id = "lead-form";
    form.scrollIntoView = jest.fn();
    document.body.appendChild(form);

    renderPlans(true);
    fireEvent.click(screen.getByRole("button", { name: "Assinar Agora" }));
    expect(form.scrollIntoView).toHaveBeenCalled();

    document.body.removeChild(form);
  });
});
