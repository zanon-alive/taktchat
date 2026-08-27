export function isPrivateLanHostname(hostname = "") {
  if (!hostname) {
    return false;
  }
  return /^(192\.168\.|10\.|172\.(1[6-9]|2\d|3[0-1])\.)/.test(hostname);
}

export function resolveLocalDevBackendUrl(hostname, port = 8080) {
  if (!hostname) {
    return null;
  }
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return `http://localhost:${port}`;
  }
  if (isPrivateLanHostname(hostname)) {
    return `http://${hostname}:${port}`;
  }
  return null;
}
