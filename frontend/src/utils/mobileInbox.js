export const PWA_START_URL = "/tickets";

export function isTicketsPath(pathname = "") {
  const path = String(pathname).split("?")[0];
  return path === "/tickets" || path.startsWith("/tickets/");
}

export function isStandaloneDisplay(matchMediaFn) {
  const mm =
    matchMediaFn ||
    (typeof window !== "undefined" && typeof window.matchMedia === "function"
      ? window.matchMedia.bind(window)
      : null);

  if (typeof mm !== "function") {
    return false;
  }

  try {
    return Boolean(mm("(display-mode: standalone)")?.matches);
  } catch {
    return false;
  }
}

export function shouldUseMobileInboxChrome({
  pathname,
  isMdUp,
  standalone,
} = {}) {
  if (!isTicketsPath(pathname)) {
    return false;
  }
  if (standalone) {
    return true;
  }
  return !isMdUp;
}
