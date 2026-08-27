import { isNativeCapacitor } from "../utils/nativeApp";

export async function initCapacitorShell() {
  if (!isNativeCapacitor()) {
    return;
  }

  try {
    const [{ App }, { StatusBar, Style }] = await Promise.all([
      import("@capacitor/app"),
      import("@capacitor/status-bar"),
    ]);

    await StatusBar.setBackgroundColor({ color: "#2563EB" });
    await StatusBar.setStyle({ style: Style.Light });

    App.addListener("backButton", () => {
      if (window.history.length > 1) {
        window.history.back();
      }
    });
  } catch (err) {
    console.debug("[capacitorShell] plugins indisponíveis", err);
  }
}
