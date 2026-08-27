const PUBLIC_AUTH_PATHS = [
  "/login",
  "/signup",
  "/signup-partner",
  "/forgot-password",
  "/reset-password",
];

export function normalizePublicPath(pathname) {
  if (!pathname) return "";
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.replace(/\/+$/, "");
  }
  return pathname;
}

export function isPublicMarketingPath(pathname) {
  const path = normalizePublicPath(pathname);
  return (
    path === "/landing" ||
    path === "/landing/v1" ||
    path === "/lgpd" ||
    path === "/tour" ||
    path === "/p/tour"
  );
}

export function shouldShowApiOfflineDialog(pathname, isOpen) {
  return Boolean(isOpen) && !isPublicMarketingPath(pathname);
}

export function isPublicAuthPath(pathname) {
  const path = normalizePublicPath(pathname);
  return PUBLIC_AUTH_PATHS.some(
    (authPath) => path === authPath || path.startsWith(`${authPath}/`)
  );
}

export function getPrivateGuestPath(guestRedirect, options = {}) {
  if (options.isNative) {
    return "/login";
  }
  return guestRedirect || "/login";
}

/**
 * Destino do visitante sem sessão. null = permanecer na URL atual.
 * Web na raiz → /landing. App nativo e rotas privadas → /login.
 */
export function getUnauthenticatedRedirect(pathname, options = {}) {
  const path = normalizePublicPath(pathname);

  if (isPublicAuthPath(path) || isPublicMarketingPath(path)) {
    return null;
  }

  if (options.isNative) {
    return "/login";
  }

  if (path === "/" || path === "") {
    return "/landing";
  }

  return "/login";
}
