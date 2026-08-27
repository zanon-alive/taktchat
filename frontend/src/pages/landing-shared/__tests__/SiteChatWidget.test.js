import React from "react";
import { render, waitFor } from "@testing-library/react";
import SiteChatWidget from "../SiteChatWidget";
import { getBackendUrl } from "../../../config";
import useSettings from "../../../hooks/useSettings";

jest.mock("../../../config", () => ({
  getBackendUrl: jest.fn(),
}));

jest.mock("../../../hooks/useSettings", () => ({
  __esModule: true,
  default: jest.fn(),
}));

describe("SiteChatWidget", () => {
  beforeEach(() => {
    document.querySelectorAll('script[src*="widget.js"]').forEach((node) => node.remove());
    delete window.TaktChatWidget;
    getBackendUrl.mockReturnValue("https://api.taktchat.com.br");
    useSettings.mockReturnValue({
      getPublicSetting: jest.fn(async (key) => {
        if (key === "enableSiteChatWidget") return "enabled";
        if (key === "siteChatWidgetCompanyId") return "1";
        return "";
      }),
    });
  });

  afterEach(() => {
    document.querySelectorAll('script[src*="widget.js"]').forEach((node) => node.remove());
  });

  it("injeta widget.js com data-api-url quando a settings está ligada", async () => {
    render(<SiteChatWidget />);
    await waitFor(() => {
      const script = document.querySelector('script[src*="widget.js"]');
      expect(script).toBeTruthy();
      expect(script.getAttribute("data-api-url")).toBe("https://api.taktchat.com.br");
      expect(script.getAttribute("data-company-id")).toBe("1");
    });
  });

  it("não injeta o script quando o widget está desligado", async () => {
    useSettings.mockReturnValue({
      getPublicSetting: jest.fn(async () => "disabled"),
    });
    render(<SiteChatWidget />);
    await waitFor(() => {
      expect(document.querySelector('script[src*="widget.js"]')).toBeNull();
    });
  });
});
