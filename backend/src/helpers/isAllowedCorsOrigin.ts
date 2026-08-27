const PRIVATE_LAN_HOST =
  /^(localhost|127\.0\.0\.1|192\.168\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3})$/;

export function isLocalDevFrontendOrigin(origin?: string): boolean {
  if (!origin) {
    return false;
  }
  try {
    const url = new URL(origin);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return false;
    }
    return PRIVATE_LAN_HOST.test(url.hostname);
  } catch {
    return false;
  }
}

export function isAllowedCorsOrigin(
  origin: string | undefined,
  allowed: string[],
  nodeEnv = process.env.NODE_ENV
): boolean {
  if (!origin) {
    return true;
  }
  if (allowed.includes(origin)) {
    return true;
  }
  if (nodeEnv !== "production" && isLocalDevFrontendOrigin(origin)) {
    return true;
  }
  return false;
}
