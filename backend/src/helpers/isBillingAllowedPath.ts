/**
 * Rotas que o admin pode usar com licença vencida (modo só faturas).
 */
export function isBillingAllowedPath(method: string, path: string): boolean {
  const m = (method || "GET").toUpperCase();
  const p = ((path || "").split("?")[0] || "/").replace(/\/+$/, "") || "/";

  if (m === "GET" && (p === "/auth/me" || p.endsWith("/auth/me"))) return true;
  if (m === "DELETE" && (p === "/auth/logout" || p.endsWith("/auth/logout"))) return true;
  if (m === "GET" && /^\/invoices(\/all|\/list|\/\d+)?$/.test(p)) return true;
  if (m === "POST" && (p === "/subscription" || p.endsWith("/subscription"))) return true;
  if (m === "GET" && /^\/plans\/\d+$/.test(p)) return true;
  if (m === "GET" && /^\/companies\/\d+$/.test(p)) return true;
  if (m === "GET" && /\/companies\/listPlan\/\d+$/.test(p)) return true;
  if ((m === "GET" || m === "POST") && (p === "/version" || p.endsWith("/version"))) return true;
  return false;
}
