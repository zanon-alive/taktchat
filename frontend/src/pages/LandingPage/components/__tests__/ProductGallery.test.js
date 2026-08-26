import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { StylesProvider, createGenerateClassName } from "@mui/styles";
import ProductGallery from "../ProductGallery";

const theme = createTheme();
const generateClassName = createGenerateClassName({ disableGlobal: true, productionPrefix: "gal" });

describe("ProductGallery", () => {
  it("liga a galeria ao tour e os prints que têm slide", () => {
    render(
      <StylesProvider generateClassName={generateClassName}>
        <ThemeProvider theme={theme}>
          <MemoryRouter>
            <ProductGallery />
          </MemoryRouter>
        </ThemeProvider>
      </StylesProvider>
    );

    expect(screen.getByRole("link", { name: "Ver as telas em sequência" })).toHaveAttribute("href", "/tour");
    expect(screen.getByRole("link", { name: "Fila de tickets" })).toHaveAttribute("href", "/tour?s=3");
    expect(screen.getByRole("link", { name: "Fluxos de automação" })).toHaveAttribute("href", "/tour?s=4");
    expect(screen.queryByRole("link", { name: "Kanban do atendimento" })).not.toBeInTheDocument();
  });
});
