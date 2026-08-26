import { create } from "jss";
import { jssPreset } from "@mui/styles";

/**
 * jss-plugin-vendor-prefixer e o unico plugin do preset MUI com os tres hooks.
 * No Firefox ele emite valores -moz-* invalidos (animation, flex-direction, color).
 */
export function isVendorPrefixerPlugin(plugin) {
  return Boolean(
    plugin &&
      typeof plugin.onProcessRule === "function" &&
      plugin.onProcessStyle &&
      plugin.onChangeValue
  );
}

export function createAppJss() {
  return create({
    plugins: jssPreset().plugins.filter(
      (plugin) => plugin && !isVendorPrefixerPlugin(plugin)
    ),
  });
}
