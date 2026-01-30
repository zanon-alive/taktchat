import fs from "fs";
import path from "path";

const LOG_PATH = path.join(__dirname, "../../../.cursor/debug.log");

export function debugLog(payload: { location: string; message: string; data?: Record<string, unknown>; hypothesisId?: string }) {
  try {
    const dir = path.dirname(LOG_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const line = JSON.stringify({ ...payload, timestamp: Date.now(), sessionId: "debug-session" }) + "\n";
    fs.appendFileSync(LOG_PATH, line);
  } catch (_) {}
}
