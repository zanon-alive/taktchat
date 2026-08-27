export const ANDROID_APK_PATH = "/downloads/taktchat.apk";

export function isNativeCapacitor(win) {
  const target =
    win ?? (typeof window !== "undefined" ? window : undefined);
  return Boolean(target?.Capacitor?.isNativePlatform?.());
}

export function getAndroidApkUrl() {
  return process.env.REACT_APP_ANDROID_APK_URL || ANDROID_APK_PATH;
}

export function shouldShowAndroidDownloadLink(win) {
  return !isNativeCapacitor(win);
}
