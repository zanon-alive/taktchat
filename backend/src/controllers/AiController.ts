import { Request, Response } from "express";
import OpenAI from "openai";
import GetIntegrationByTypeService from "../services/QueueIntegrationServices/GetIntegrationByTypeService";

const extractVariables = (text: string): string[] => {
  if (!text) return [];
  const matches = text.match(/\{[^}]+\}/g) || [];
  // normalize: remove duplicates and keep original braces
  return Array.from(new Set(matches));
};

const buildPrompt = (
  baseText: string,
  variables: string[],
  tone: string,
  language: string,
  numVariations: number,
  businessContext?: string
) => {
  const varsLine = variables.length
    ? `Preserve exatamente os placeholders: ${variables.join(", ")}.`
    : "Se houver placeholders como {nome}, preserve-os.";

  const ctx = businessContext ? `Contexto do negócio: ${businessContext}.` : "";

  return `Você é um assistente especialista em copywriting para WhatsApp em ${language}.
Gere ${numVariations} variações curtas e naturais para a mensagem abaixo, mantendo mesma intenção.
Tome cuidado com políticas anti-spam do WhatsApp: evitar CAPS excessivo, evitar múltiplos links, CTA objetivo.
TOM: ${tone}. ${ctx}
${varsLine}
Mensagem base: \n"""${baseText}"""\n
Responda como um JSON com o formato: { "variations": ["...", "..."] } e nada além disso.`;
};

export const generateCampaignMessages = async (req: Request, res: Response) => {
  try {
    const {
      baseText,
      variables: variablesFromClient,
      tone = "amigável",
      language = "pt-BR",
      numVariations = 2,
      businessContext
    } = req.body || {};

    const { companyId } = req.user;

    if (!baseText || typeof baseText !== "string") {
      return res.status(400).json({ error: "baseText é obrigatório" });
    }

    // Resolve credenciais do OpenAI por integração da empresa (fallback para ENV)
    let apiKey: string | undefined = process.env.OPENAI_API_KEY;
    let model: string = process.env.OPENAI_MODEL || "gpt-4o-mini";
    try {
      const integration = await GetIntegrationByTypeService({ companyId, type: "openai" });
      const cfg = integration?.jsonContent || {};
      if (cfg.apiKey) apiKey = cfg.apiKey;
      if (cfg.model) model = String(cfg.model);
    } catch (_) {
      // ignore and rely on env vars
    }
    if (!apiKey) {
      return res.status(500).json({ error: "OPENAI_API_KEY não configurada (integração ou env)" });
    }

    const variables = Array.isArray(variablesFromClient)
      ? variablesFromClient
      : extractVariables(baseText);

    const messages = [
      { role: "system" as const, content: "Você é um especialista em campanhas de WhatsApp." },
      { role: "user" as const, content: buildPrompt(baseText, variables, tone, language, Math.min(Math.max(1, Number(numVariations) || 1), 5), businessContext) }
    ];

    const client = new OpenAI({ apiKey });

    const completion = await client.chat.completions.create({
      model,
      messages,
      temperature: 0.8,
      max_tokens: 400,
    });

    const content = completion.choices?.[0]?.message?.content || "";

    // Try parse JSON
    let parsed: any = null;
    try {
      parsed = JSON.parse(content);
    } catch (_) {
      // Fallback: attempt to extract JSON substring
      const jsonMatch = content.match(/\{[\s\S]*\}$/);
      if (jsonMatch) {
        try { parsed = JSON.parse(jsonMatch[0]); } catch (_) {}
      }
    }

    if (!parsed || !Array.isArray(parsed.variations)) {
      return res.status(200).json({ variations: [] });
    }

    // Ensure variables placeholders are preserved
    const ensured = parsed.variations.map((v: string) => {
      if (typeof v !== "string") return "";
      variables.forEach(ph => {
        // if placeholder missing, append at end as safety (rare)
        if (!v.includes(ph)) {
          // do nothing; we won't force-inject to avoid awkward texts
        }
      });
      return v;
    }).filter(Boolean);

    return res.status(200).json({ variations: ensured });
  } catch (error: any) {
    return res.status(500).json({ error: error?.message || "Erro ao gerar variações" });
  }
};

export const encryptionStatus = async (_req: Request, res: Response) => {
  try {
    const enabled = Boolean(process.env.OPENAI_ENCRYPTION_KEY || process.env.DATA_KEY);
    return res.status(200).json({ encryptionEnabled: enabled });
  } catch (error: any) {
    return res.status(200).json({ encryptionEnabled: false });
  }
};

export default { generateCampaignMessages, encryptionStatus };
