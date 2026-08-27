import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import useSupportWhatsApp from "../useSupportWhatsApp";
import { resetSupportWhatsAppCache } from "../supportWhatsApp";
import { openApi } from "../../../services/api";

jest.mock("../../../services/api", () => ({
  openApi: {
    request: jest.fn(),
  },
}));

function Probe() {
  const { number, ready, url } = useSupportWhatsApp();
  return (
    <div>
      <span data-testid="ready">{String(ready)}</span>
      <span data-testid="number">{number}</span>
      <span data-testid="url">{url || ""}</span>
    </div>
  );
}

describe("useSupportWhatsApp", () => {
  beforeEach(() => {
    resetSupportWhatsAppCache();
    openApi.request.mockReset();
  });

  it("expõe a URL quando a settings responde", async () => {
    openApi.request.mockResolvedValue({ data: "5514999990000" });
    render(<Probe />);
    await waitFor(() => expect(screen.getByTestId("ready")).toHaveTextContent("true"));
    expect(screen.getByTestId("number")).toHaveTextContent("5514999990000");
    expect(screen.getByTestId("url")).toHaveTextContent("https://wa.me/5514999990000");
  });

  it("fica pronto sem URL se a settings vier vazia", async () => {
    openApi.request.mockResolvedValue({ data: "" });
    render(<Probe />);
    await waitFor(() => expect(screen.getByTestId("ready")).toHaveTextContent("true"));
    expect(screen.getByTestId("url")).toHaveTextContent("");
  });
});
