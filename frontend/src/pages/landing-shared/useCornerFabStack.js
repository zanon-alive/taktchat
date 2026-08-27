import { useEffect, useState } from "react";
import {
  COOKIE_BANNER_SELECTOR,
  SITE_CHAT_BUTTON_ID,
  computeCornerStack,
} from "./cornerFabStack";
import { API_OFFLINE_DIALOG_TITLE_ID } from "../../utils/publicSitePaths";

function measureCornerState() {
  const banner = document.querySelector(COOKIE_BANNER_SELECTOR);
  return {
    cookieHeight: banner ? Math.ceil(banner.getBoundingClientRect().height) : 0,
    siteChatPresent: Boolean(document.getElementById(SITE_CHAT_BUTTON_ID)),
    apiDialogOpen: Boolean(document.getElementById(API_OFFLINE_DIALOG_TITLE_ID)),
  };
}

export default function useCornerFabStack({ minBottom } = {}) {
  const [cookieHeight, setCookieHeight] = useState(0);
  const [siteChatPresent, setSiteChatPresent] = useState(false);
  const [apiDialogOpen, setApiDialogOpen] = useState(() =>
    typeof document !== "undefined" && Boolean(document.getElementById(API_OFFLINE_DIALOG_TITLE_ID))
  );

  useEffect(() => {
    let observedBanner = null;
    let resizeObserver = null;

    const apply = () => {
      const next = measureCornerState();
      setCookieHeight(next.cookieHeight);
      setSiteChatPresent(next.siteChatPresent);
      setApiDialogOpen(next.apiDialogOpen);

      const banner = document.querySelector(COOKIE_BANNER_SELECTOR);
      if (typeof ResizeObserver === "function" && banner && banner !== observedBanner) {
        if (!resizeObserver) {
          resizeObserver = new ResizeObserver(() => apply());
        }
        if (observedBanner) {
          resizeObserver.unobserve(observedBanner);
        }
        resizeObserver.observe(banner);
        observedBanner = banner;
      }
    };

    apply();
    const mutationObserver = new MutationObserver(apply);
    mutationObserver.observe(document.body, { childList: true, subtree: true });
    window.addEventListener("resize", apply);

    return () => {
      mutationObserver.disconnect();
      resizeObserver?.disconnect();
      window.removeEventListener("resize", apply);
    };
  }, []);

  const stack = computeCornerStack({ cookieHeight, siteChatPresent, minBottom });

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--taktchat-site-chat-bottom", `${stack.siteChatBottom}px`);
    root.style.setProperty("--taktchat-site-chat-panel-bottom", `${stack.siteChatPanelBottom}px`);
    return () => {
      root.style.removeProperty("--taktchat-site-chat-bottom");
      root.style.removeProperty("--taktchat-site-chat-panel-bottom");
    };
  }, [stack.siteChatBottom, stack.siteChatPanelBottom]);

  return { ...stack, apiDialogOpen };
}
