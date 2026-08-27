import React from "react";
import { render, screen } from "@testing-library/react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { StylesProvider, createGenerateClassName } from "@mui/styles";
import ChatWidget from "../ChatWidget";

const theme = createTheme();
const generateClassName = createGenerateClassName({ disableGlobal: true, productionPrefix: "wa" });

describe("ChatWidget", () => {
  it("abre o WhatsApp de suporte sem passar pelo formulário", () => {
    render(
      <StylesProvider generateClassName={generateClassName}>
        <ThemeProvider theme={theme}>
          <ChatWidget />
        </ThemeProvider>
      </StylesProvider>
    );

    expect(screen.getByRole("link", { name: "Falar no WhatsApp" })).toHaveAttribute(
      "href",
      expect.stringMatching(/^https:\/\/wa\.me\/\d+\?text=/)
    );
  });
});
