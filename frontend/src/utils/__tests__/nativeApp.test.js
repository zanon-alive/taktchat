const fs = require("fs");
const path = require("path");

import {
  ANDROID_APK_PATH,
  getAndroidApkUrl,
  isNativeCapacitor,
  shouldShowAndroidDownloadLink,
} from "../nativeApp";

describe("isNativeCapacitor", () => {
  it("é verdadeiro quando Capacitor.isNativePlatform retorna true", () => {
    const win = {
      Capacitor: { isNativePlatform: () => true },
    };
    expect(isNativeCapacitor(win)).toBe(true);
  });

  it("é falso no browser comum", () => {
    expect(isNativeCapacitor({})).toBe(false);
    expect(isNativeCapacitor({ Capacitor: {} })).toBe(false);
    expect(isNativeCapacitor({ Capacitor: { isNativePlatform: () => false } })).toBe(
      false
    );
  });
});

describe("download do APK", () => {
  const previous = process.env.REACT_APP_ANDROID_APK_URL;

  afterEach(() => {
    if (previous === undefined) {
      delete process.env.REACT_APP_ANDROID_APK_URL;
    } else {
      process.env.REACT_APP_ANDROID_APK_URL = previous;
    }
  });

  it("usa o caminho do site por padrão", () => {
    delete process.env.REACT_APP_ANDROID_APK_URL;
    expect(getAndroidApkUrl()).toBe(ANDROID_APK_PATH);
    expect(ANDROID_APK_PATH).toBe("/downloads/taktchat.apk");
  });

  it("nginx redireciona o APK para o release android-sideload", () => {
    const nginx = fs.readFileSync(
      path.join(__dirname, "../../../nginx.conf"),
      "utf8"
    );
    expect(nginx).toContain("location = /downloads/taktchat.apk");
    expect(nginx).toContain("android-sideload/taktchat.apk");
  });

  it("esconde o link dentro do app nativo", () => {
    expect(
      shouldShowAndroidDownloadLink({
        Capacitor: { isNativePlatform: () => true },
      })
    ).toBe(false);
    expect(shouldShowAndroidDownloadLink({})).toBe(true);
  });
});

describe("capacitor.config.json", () => {
  const config = JSON.parse(
    fs.readFileSync(
      path.join(__dirname, "../../../capacitor.config.json"),
      "utf8"
    )
  );

  it("aponta o WebView para produção e identifica o app", () => {
    expect(config.appId).toBe("br.com.taktchat.app");
    expect(config.appName).toBe("Taktchat");
    expect(config.server.url).toBe("https://taktchat.com.br");
    expect(config.server.androidScheme).toBe("https");
  });
});

describe("ícone Android", () => {
  it("tem launcher PNG gerado (não vazio)", () => {
    const icon = path.join(
      __dirname,
      "../../../android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png"
    );
    const buf = fs.readFileSync(icon);
    expect(buf.slice(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))).toBe(
      true
    );
    expect(buf.length).toBeGreaterThan(10000);
  });
});
