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

export function getPrivateGuestPath(guestRedirect) {
  return guestRedirect || "/login";
}
