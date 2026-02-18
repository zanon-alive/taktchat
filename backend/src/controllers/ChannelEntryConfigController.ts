import { Request, Response } from "express";
import ListChannelEntryConfigsService from "../services/ChannelEntryConfigService/ListChannelEntryConfigsService";
import CreateOrUpdateChannelEntryConfigService from "../services/ChannelEntryConfigService/CreateOrUpdateChannelEntryConfigService";
import AppError from "../errors/AppError";

interface UpdateBody {
  entrySource: string;
  defaultQueueId?: number | null;
  defaultTagId?: number | null;
  whatsappId?: number | null;
  welcomeMessage?: string | null;
}

export const index = async (req: Request, res: Response): Promise<Response> => {
  const companyId = req.user?.companyId;
  if (!companyId) {
    throw new AppError("Usuário sem empresa.", 401);
  }
  const configs = await ListChannelEntryConfigsService(companyId);
  return res.status(200).json(configs);
};

export const update = async (req: Request, res: Response): Promise<Response> => {
  const companyId = req.user?.companyId;
  if (!companyId) {
    throw new AppError("Usuário sem empresa.", 401);
  }
  const { entrySource, defaultQueueId, defaultTagId, whatsappId, welcomeMessage } = req.body as UpdateBody;
  if (!entrySource) {
    throw new AppError("entrySource é obrigatório.", 400);
  }
  const config = await CreateOrUpdateChannelEntryConfigService({
    companyId,
    entrySource,
    defaultQueueId: defaultQueueId ?? null,
    defaultTagId: defaultTagId ?? null,
    whatsappId: whatsappId ?? null,
    welcomeMessage: welcomeMessage ?? null
  });
  return res.status(200).json(config);
};
