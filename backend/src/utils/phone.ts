import logger from "./logger";

export interface NormalizedPhoneResult {
  canonical: string | null;
  digits: string;
}

export interface CountryMetadata {
  iso: string;
  ddi: string;
  areaCodeLength?: number;
  mobileIndicatorPrefix?: string;
  mobileNationalLengths?: number[];
  landlineNationalLengths?: number[];
}

export const COUNTRY_METADATA: Record<string, CountryMetadata> = {
  "55": {
    iso: "BR",
    ddi: "55",
    areaCodeLength: 2,
    mobileNationalLengths: [11],
    landlineNationalLengths: [10]
  },
  "54": {
    iso: "AR",
    ddi: "54",
    areaCodeLength: 2,
    mobileIndicatorPrefix: "9",
    mobileNationalLengths: [11],
    landlineNationalLengths: [10]
  },
  "1": {
    iso: "US",
    ddi: "1",
    areaCodeLength: 3,
    mobileNationalLengths: [10],
    landlineNationalLengths: [10]
  }
};

export interface ResolvedCountry {
  metadata?: CountryMetadata;
  national: string;
  ddi: string | null;
}

const sortedCountryKeys = Object.keys(COUNTRY_METADATA).sort((a, b) => b.length - a.length);

export const resolveCountryMetadata = (digits: string): ResolvedCountry => {
  for (const key of sortedCountryKeys) {
    if (digits.startsWith(key)) {
      return {
        metadata: COUNTRY_METADATA[key],
        national: digits.slice(key.length),
        ddi: key
      };
    }
  }

  return {
    metadata: undefined,
    national: digits,
    ddi: null
  };
};

const hasKnownDdi = (digits: string): boolean => {
  return sortedCountryKeys.some(key => digits.startsWith(key));
};

/**
 * Normaliza um número de telefone para formato canônico:
 * - Remove caracteres não numéricos
 * - Remove zeros à esquerda
 * - Mantém DDI conhecido; assume Brasil (55) quando não houver DDI e o tamanho indicar número nacional
 */
export const normalizePhoneNumber = (
  value: string | null | undefined
): NormalizedPhoneResult => {
  if (value === null || value === undefined) {
    return { canonical: null, digits: "" };
  }

  const raw = String(value).trim();
  if (!raw) {
    return { canonical: null, digits: "" };
  }

  const digitsOnly = raw.replace(/\D/g, "");
  if (!digitsOnly) {
    return { canonical: null, digits: "" };
  }

  // Remove zeros à esquerda
  let canonical = digitsOnly.replace(/^0+/, "");
  if (!canonical) {
    return { canonical: null, digits: "" };
  }

  if (!hasKnownDdi(canonical)) {
    // Se não reconhecemos DDI mas o número parece nacional (10/11 dígitos), assumir Brasil
    if (canonical.length >= 10 && canonical.length <= 11) {
      canonical = `55${canonical}`;
    }
  }

  return { canonical, digits: canonical };
};

/**
 * Retorna true se os dois números representarem o mesmo contato após normalização.
 */
export const arePhoneNumbersEquivalent = (
  a: string | null | undefined,
  b: string | null | undefined
): boolean => {
  const first = normalizePhoneNumber(a).canonical;
  const second = normalizePhoneNumber(b).canonical;
  return !!first && !!second && first === second;
};

/**
 * Helper seguro para aplicar normalização centralizada com log em caso de erro.
 */
export const safeNormalizePhoneNumber = (
  value: string | null | undefined
): NormalizedPhoneResult => {
  try {
    return normalizePhoneNumber(value);
  } catch (err) {
    logger.warn({ value, err }, "[phone.safeNormalize] Erro ao normalizar número");
    return { canonical: null, digits: "" };
  }
};
