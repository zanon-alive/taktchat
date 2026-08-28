export function formatQuickReplyLabel(shortcode) {
  const code = String(shortcode || "").replace(/^\/+/, "").trim();
  return code ? `/${code}` : "";
}
