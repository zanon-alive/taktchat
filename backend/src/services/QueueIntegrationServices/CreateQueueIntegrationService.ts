import * as Yup from "yup";

import AppError from "../../errors/AppError";
import QueueIntegrations from "../../models/QueueIntegrations";
import { encryptString } from "../../utils/crypto";


interface Request {
  type: string;
  name: string;
  projectName: string;
  jsonContent: string;
  language: string;
  urlN8N?: string;
  companyId: number;
  typebotSlug?: string;
  typebotExpires?: number;
  typebotKeywordFinish?: string;
  typebotUnknownMessage?: string;
  typebotDelayMessage?: number;
  typebotKeywordRestart?: string;
  typebotRestartMessage?: string;
}

const CreateQueueIntegrationService = async ({
  type,
  name,
  projectName,
  jsonContent,
  language,
  urlN8N,
  companyId,
  typebotExpires,
  typebotKeywordFinish,
  typebotSlug,
  typebotUnknownMessage,
  typebotDelayMessage,
  typebotKeywordRestart,
  typebotRestartMessage 
}: Request): Promise<QueueIntegrations> => {
  const schema = Yup.object().shape({
    name: Yup.string()
      .required()
      .min(2)
      .test(
        "Check-name",
        "This integration name is already used.",
        async value => {
          if (!value) return false;
          const nameExists = await QueueIntegrations.findOne({
            where: { name: value, companyId }
          });
          return !nameExists;
        }
      )
  });

  try {
    await schema.validate({ type, name, projectName, jsonContent, language, urlN8N, companyId });
  } catch (err) {
    throw new AppError(err.message);
  }


  // Encrypt OpenAI apiKey if present
  let jsonToPersist: string = jsonContent;
  if (type === "openai" && jsonContent) {
    try {
      const parsed = JSON.parse(jsonContent);
      if (parsed?.apiKey && typeof parsed.apiKey === "string" && !String(parsed.apiKey).startsWith("ENC::")) {
        parsed.apiKey = encryptString(parsed.apiKey);
      }
      jsonToPersist = JSON.stringify(parsed);
    } catch (_) {
      // if JSON invalid, keep as is
    }
  }

  const queueIntegration = await QueueIntegrations.create(
    {
      type,
      name,
      projectName,
      jsonContent: jsonToPersist,
      language,
      urlN8N,
      companyId,
      typebotExpires,
      typebotKeywordFinish,
      typebotSlug,
      typebotUnknownMessage,
      typebotDelayMessage,
      typebotKeywordRestart,
      typebotRestartMessage 
    }
  );

  return queueIntegration;
};

export default CreateQueueIntegrationService;