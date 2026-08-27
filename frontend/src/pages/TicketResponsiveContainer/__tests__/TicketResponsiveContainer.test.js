import React from "react";
import { render, screen } from "@testing-library/react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useMediaQuery } from "@mui/material";

jest.mock("@mui/material", () => {
  const actual = jest.requireActual("@mui/material");
  return {
    ...actual,
    useMediaQuery: jest.fn(),
  };
});

jest.mock("../../../utils/mobileInbox", () => ({
  ...jest.requireActual("../../../utils/mobileInbox"),
  isStandaloneDisplay: jest.fn(() => false),
}));

jest.mock("../../TicketsCustom", () => () => (
  <div data-testid="tickets-desktop" />
));
jest.mock("../../TicketsAdvanced", () => () => (
  <div data-testid="tickets-mobile" />
));

import TicketResponsiveContainer from "../index";
import { isStandaloneDisplay } from "../../../utils/mobileInbox";

const theme = createTheme();

function renderContainer() {
  return render(
    <ThemeProvider theme={theme}>
      <TicketResponsiveContainer />
    </ThemeProvider>
  );
}

describe("TicketResponsiveContainer", () => {
  beforeEach(() => {
    useMediaQuery.mockReturnValue(false);
    isStandaloneDisplay.mockReturnValue(false);
  });

  it("mostra o layout avancado abaixo de md", () => {
    useMediaQuery.mockReturnValue(false);
    renderContainer();
    expect(screen.getByTestId("tickets-mobile")).toBeInTheDocument();
    expect(screen.queryByTestId("tickets-desktop")).not.toBeInTheDocument();
  });

  it("mostra o split desktop em md+", () => {
    useMediaQuery.mockReturnValue(true);
    renderContainer();
    expect(screen.getByTestId("tickets-desktop")).toBeInTheDocument();
    expect(screen.queryByTestId("tickets-mobile")).not.toBeInTheDocument();
  });

  it("no PWA standalone usa o layout de conversa mesmo em md+", () => {
    useMediaQuery.mockReturnValue(true);
    isStandaloneDisplay.mockReturnValue(true);
    renderContainer();
    expect(screen.getByTestId("tickets-mobile")).toBeInTheDocument();
    expect(screen.queryByTestId("tickets-desktop")).not.toBeInTheDocument();
  });
});
