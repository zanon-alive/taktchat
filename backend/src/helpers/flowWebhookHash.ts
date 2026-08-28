export const hasFlowWebhookHash = (hashFlowId?: string | null): boolean => {
  if (hashFlowId == null) {
    return false;
  }
  const value = String(hashFlowId).trim();
  return value.length > 0 && value !== "undefined" && value !== "null";
};
