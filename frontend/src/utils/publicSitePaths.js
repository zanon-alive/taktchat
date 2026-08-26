export function isPublicMarketingPath(pathname) {
  if (!pathname) return false;
  return (
    pathname === "/landing" ||
    pathname === "/landing/v1" ||
    pathname === "/lgpd"
  );
}

export function getPrivateGuestPath(guestRedirect) {
  return guestRedirect || "/login";
}
