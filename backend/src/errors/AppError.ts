export function toHttpStatusCode(value: unknown, fallback = 400): number {
  const parsed = Number(value);
  if (Number.isInteger(parsed) && parsed >= 100 && parsed < 600) {
    return parsed;
  }
  return fallback;
}

class AppError {
  public readonly message: string;

  public readonly statusCode: number;

  constructor(message: string, statusCode: unknown = 400) {
    this.message = message;
    this.statusCode = toHttpStatusCode(statusCode);
  }
}

export default AppError;
