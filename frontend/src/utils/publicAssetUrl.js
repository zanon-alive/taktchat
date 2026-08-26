/**
 * Monta URL de asset público do backend sem duplicar /public/ nem prefixar URLs absolutas.
 * @param {string} backendUrl
 * @param {string|null|undefined} pathOrUrl caminho relativo, path já com /public/, ou URL http(s)
 * @returns {string|null}
 */
export function resolvePublicAssetUrl(backendUrl, pathOrUrl) {
  if (pathOrUrl == null) return null;
  const value = String(pathOrUrl).trim();
  if (!value) return null;

  if (/^https?:\/\//i.test(value) || value.startsWith("data:") || value.startsWith("blob:")) {
    return value;
  }

  const base = String(backendUrl || "").replace(/\/+$/, "");
  if (!base) {
    return value.startsWith("/") ? value : `/${value}`;
  }

  if (value.startsWith(base)) {
    return value;
  }

  const path = value.replace(/^\/+/, "");
  if (path.startsWith("public/")) {
    return `${base}/${path}`;
  }
  return `${base}/public/${path}`;
}
