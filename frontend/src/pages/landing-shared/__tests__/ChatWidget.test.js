import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { StylesProvider, createGenerateClassName } from "@mui/styles";
import { API_OFFLINE_DIALOG_TITLE_ID } from "../../../utils/publicSitePaths";

jest.mock("../useSupportWhatsApp", () => ({
  __esModule: true,
  default: () => ({
    number: "5514999990000",
    ready: true,
    url: `https://wa.me/5514999990000?text=${encodeURIComponent(
      "Olá! Vi o TaktChat e quero conhecer. Podem me ajudar?"
    )}`,
  }),
}));

import ChatWidget from "../ChatWidget";

const theme = createTheme();
const generateClassName = createGenerateClassName({ disableGlobal: true, productionPrefix: "wa" });

const renderFab = () =>
  render(
    <StylesProvider generateClassName={generateClassName}>
      <ThemeProvider theme={theme}>
        <ChatWidget />
      </ThemeProvider>
    </StylesProvider>
  );

describe("ChatWidget", () => {
  afterEach(() => {
    document.querySelector(".taktchat-cookie-banner")?.remove();
    document.getElementById("taktchat-widget-button")?.remove();
    document.getElementById(API_OFFLINE_DIALOG_TITLE_ID)?.remove();
    document.documentElement.style.removeProperty("--taktchat-site-chat-bottom");
    document.documentElement.style.removeProperty("--taktchat-site-chat-panel-bottom");
  });

  it("abre o WhatsApp de suporte sem passar pelo formulário", () => {
    const { container } = renderFab();

    const link = screen.getByRole("link", { name: "Falar no WhatsApp" });
    expect(link).toHaveAttribute("href", expect.stringMatching(/^https:\/\/wa\.me\/\d+\?text=/));
    expect(container.contains(link)).toBe(false);
    expect(document.body.contains(link)).toBe(true);
  });

  it("informa ao chat do site um recuo quando o banner de cookies aparece", async () => {
    const banner = document.createElement("div");
    banner.className = "taktchat-cookie-banner";
    banner.getBoundingClientRect = () => ({
      height: 120,
      width: 390,
      top: 0,
      left: 0,
      bottom: 120,
      right: 390,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });
    document.body.appendChild(banner);

    renderFab();

    await waitFor(() => {
      expect(document.documentElement.style.getPropertyValue("--taktchat-site-chat-bottom")).toBe(
        "140px"
      );
    });
  });

  it("empilha o chat do site acima do FAB", async () => {
    const siteChat = document.createElement("button");
    siteChat.id = "taktchat-widget-button";
    document.body.appendChild(siteChat);

    renderFab();

    await waitFor(() => {
      expect(document.documentElement.style.getPropertyValue("--taktchat-site-chat-bottom")).toBe(
        "84px"
      );
    });
  });

  it("não mostra o FAB se o aviso de API já está aberto no carregamento", () => {
    const title = document.createElement("h2");
    title.id = API_OFFLINE_DIALOG_TITLE_ID;
    title.textContent = "Servidor de API indisponível";
    document.body.appendChild(title);

    renderFab();

    expect(screen.queryByRole("link", { name: "Falar no WhatsApp" })).not.toBeInTheDocument();
  });

  it("esconde o FAB enquanto o aviso de API indisponível está aberto", async () => {
    renderFab();
    expect(screen.getByRole("link", { name: "Falar no WhatsApp" })).toBeInTheDocument();

    const title = document.createElement("h2");
    title.id = API_OFFLINE_DIALOG_TITLE_ID;
    title.textContent = "Servidor de API indisponível";
    document.body.appendChild(title);

    await waitFor(() => {
      expect(screen.queryByRole("link", { name: "Falar no WhatsApp" })).not.toBeInTheDocument();
    });
  });
});
