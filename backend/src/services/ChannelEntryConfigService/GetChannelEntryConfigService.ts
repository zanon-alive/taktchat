import ChannelEntryConfig from "../../models/ChannelEntryConfig";
import Queue from "../../models/Queue";
import Tag from "../../models/Tag";

export interface ChannelEntryConfigResult {
  defaultQueueId: number | null;
  defaultTagId: number | null;
  whatsappId: number | null;
}

const TAG_NAMES_BY_SOURCE: Record<string, string> = {
  lead: "Lead",
  revendedor: "Revendedor",
  site_chat: "Chat do site"
};

const GetChannelEntryConfigService = async (
  companyId: number,
  entrySource: string
): Promise<ChannelEntryConfigResult> => {
  const config = await ChannelEntryConfig.findOne({
    where: { companyId, entrySource }
  });

  if (config) {
    return {
      defaultQueueId: config.defaultQueueId ?? null,
      defaultTagId: config.defaultTagId ?? null,
      whatsappId: config.whatsappId ?? null
    };
  }

  const queue = await Queue.findOne({
    where: { companyId },
    order: [["id", "ASC"]]
  });

  const tagName = TAG_NAMES_BY_SOURCE[entrySource] || "Lead";
  const [tag] = await Tag.findOrCreate({
    where: { name: tagName, companyId },
    defaults: { name: tagName, color: "#25D366", kanban: 0, companyId }
  });

  return {
    defaultQueueId: queue?.id ?? null,
    defaultTagId: tag?.id ?? null,
    whatsappId: null
  };
};

export default GetChannelEntryConfigService;
