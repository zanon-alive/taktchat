/**
 * Filtro opcional para reduzir ruído no console causado por erros/mensagens
 * esperados do libsignal/Baileys (decrypt, Bad MAC, Session error, Closing session).
 * Ativar com SUPPRESS_BAILEYS_DECRYPT_LOGS=1.
 * Ver .docs/diagnosticos/logs-whatsapp-baileys.md
 */

const PATTERNS_ERROR = [
  /failed to decrypt/i,
  /Bad MAC/i,
  /Session error:\s*Error:\s*Bad MAC/i,
  /verifyMAC/i,
  /SessionCipher\.doDecryptWhisperMessage/i,
];

const PATTERNS_LOG = [
  /Closing open session in favor of incoming prekey bundle/i,
  /Closing session/i,
  /SessionEntry\s*\{/i,
];

function stringifyArg(a: unknown): string {
  if (typeof a === "string") return a;
  if (a && typeof a === "object" && "message" in a) return (a as Error).message ?? String(a);
  return String(a);
}

function shouldSuppressError(args: unknown[]): boolean {
  const str = args.map(stringifyArg).join(" ");
  return PATTERNS_ERROR.some((re) => re.test(str));
}

function shouldSuppressLog(args: unknown[]): boolean {
  const str = args.map(stringifyArg).join(" ");
  return PATTERNS_LOG.some((re) => re.test(str));
}

export function installSuppressBaileysDecryptLogs(): void {
  if (process.env.SUPPRESS_BAILEYS_DECRYPT_LOGS !== "1") return;

  const originalError = console.error;
  console.error = (...args: unknown[]) => {
    if (shouldSuppressError(args)) return;
    originalError.apply(console, args);
  };

  const originalLog = console.log;
  console.log = (...args: unknown[]) => {
    if (shouldSuppressLog(args)) return;
    originalLog.apply(console, args);
  };
}
