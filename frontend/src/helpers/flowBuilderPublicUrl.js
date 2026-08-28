import { getBackendUrl } from "../config";

export const flowBuilderPublicUrl = storedName => {
  if (!storedName) {
    return "";
  }
  if (/^https?:\/\//i.test(storedName)) {
    return storedName;
  }

  const backend = String(getBackendUrl() || "").replace(/\/+$/, "");
  const cleaned = String(storedName)
    .replace(/\\/g, "/")
    .replace(/^\/+/, "");

  if (cleaned.startsWith("public/")) {
    return `${backend}/${cleaned}`;
  }
  if (cleaned.startsWith("flowbuilder/") || /^company\d+\//.test(cleaned)) {
    return `${backend}/public/${cleaned}`;
  }
  return `${backend}/public/flowbuilder/${cleaned}`;
};
