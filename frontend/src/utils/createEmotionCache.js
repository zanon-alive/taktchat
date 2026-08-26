import createCache from "@emotion/cache";
import { prefixer } from "stylis";
import { dropMsCssSelectors } from "./dropMsCssSelectors";

/**
 * Cache Emotion da app. `stylisPlugins` substitui o default — o prefixer
 * precisa ser reincluido, senao o Emotion deixa de prefixar para Safari.
 */
export function createEmotionCache() {
  return createCache({
    key: "css",
    stylisPlugins: [prefixer, dropMsCssSelectors],
  });
}
