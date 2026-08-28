/**
 * Filtro de ruído do libsignal/Baileys (decrypt, Bad MAC, dump de sessão).
 * Dump de sessão (console.log) é filtrado sempre: inclui chaves e não ajuda operação.
 * Erros de decrypt no console.error só somem com SUPPRESS_BAILEYS_DECRYPT_LOGS=1.
 * Ver .docs/diagnosticos/logs-whatsapp-baileys.md
 */

const PATTERNS_ERROR = [
  /failed to decrypt/i,
  /Bad MAC/i,
  /Session error:\s*Error:\s*Bad MAC/i,
  /verifyMAC/i,
  /SessionCipher\.doDecryptWhisperMessage/i
];

const PATTERNS_LOG = [
  /Closing stale open session/i,
  /Closing open session in favor of incoming prekey bundle/i,
  /Closing session/i,
  /SessionEntry\s*\{/i
];

function stringifyArg(a: unknown): string {
  if (typeof a === "string") return a;
  if (a && typeof a === "object" && "message" in a) {
    return (a as Error).message ?? String(a);
  }
  return String(a);
}

export const shouldSuppressBaileysSessionLog = (args: unknown[]): boolean => {
  const str = args.map(stringifyArg).join(" ");
  return PATTERNS_LOG.some(re => re.test(str));
};

function shouldSuppressError(args: unknown[]): boolean {
  const str = args.map(stringifyArg).join(" ");
  return PATTERNS_ERROR.some(re => re.test(str));
}

export function installSuppressBaileysDecryptLogs(): void {
  const originalLog = console.log;
  console.log = (...args: unknown[]) => {
    if (shouldSuppressBaileysSessionLog(args)) return;
    originalLog.apply(console, args);
  };

  if (process.env.SUPPRESS_BAILEYS_DECRYPT_LOGS !== "1") return;

  const originalError = console.error;
  console.error = (...args: unknown[]) => {
    if (shouldSuppressError(args)) return;
    originalError.apply(console, args);
  };
}
