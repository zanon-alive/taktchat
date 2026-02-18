import ChannelEntryConfig from "../../models/ChannelEntryConfig";
import Queue from "../../models/Queue";
import Tag from "../../models/Tag";
import Whatsapp from "../../models/Whatsapp";
import AppError from "../../errors/AppError";

const ALLOWED_ENTRY_SOURCES = ["lead", "revendedor", "site_chat"] as const;

interface Request {
  companyId: number;
  entrySource: string;
  defaultQueueId?: number | null;
  defaultTagId?: number | null;
  whatsappId?: number | null;
  welcomeMessage?: string | null;
}

const CreateOrUpdateChannelEntryConfigService = async (data: Request): Promise<ChannelEntryConfig> => {
  const { companyId, entrySource, defaultQueueId, defaultTagId, whatsappId, welcomeMessage } = data;

  if (!ALLOWED_ENTRY_SOURCES.includes(entrySource as any)) {
    throw new AppError("entrySource inválido. Use: lead, revendedor ou site_chat.", 400);
  }

  if (defaultQueueId != null) {
    const queue = await Queue.findOne({ where: { id: defaultQueueId, companyId } });
    if (!queue) {
      throw new AppError("Fila não encontrada ou não pertence à empresa.", 400);
    }
  }

  if (defaultTagId != null) {
    const tag = await Tag.findOne({ where: { id: defaultTagId, companyId } });
    if (!tag) {
      throw new AppError("Tag não encontrada ou não pertence à empresa.", 400);
    }
  }

  if (whatsappId != null) {
    const whatsapp = await Whatsapp.findOne({ where: { id: whatsappId, companyId } });
    if (!whatsapp) {
      throw new AppError("Conexão WhatsApp não encontrada ou não pertence à empresa.", 400);
    }
  }

  const [config] = await ChannelEntryConfig.findOrCreate({
    where: { companyId, entrySource },
    defaults: {
      companyId,
      entrySource,
      defaultQueueId: defaultQueueId ?? null,
      defaultTagId: defaultTagId ?? null,
      whatsappId: whatsappId ?? null,
      welcomeMessage: welcomeMessage?.trim() || null
    }
  });

  await config.update({
    defaultQueueId: defaultQueueId ?? null,
    defaultTagId: defaultTagId ?? null,
    whatsappId: whatsappId ?? null,
    welcomeMessage: welcomeMessage?.trim() || null
  });

  return config;
};

export default CreateOrUpdateChannelEntryConfigService;
