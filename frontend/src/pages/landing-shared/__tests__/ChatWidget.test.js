import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { StylesProvider, createGenerateClassName } from "@mui/styles";
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
});
