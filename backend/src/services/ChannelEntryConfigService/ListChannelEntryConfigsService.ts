import ChannelEntryConfig from "../../models/ChannelEntryConfig";
import { Op } from "sequelize";

const ENTRY_SOURCES = ["lead", "revendedor", "site_chat"];

const ListChannelEntryConfigsService = async (companyId: number) => {
  const configs = await ChannelEntryConfig.findAll({
    where: {
      companyId,
      entrySource: { [Op.in]: ENTRY_SOURCES }
    },
    order: [["entrySource", "ASC"]],
    include: [
      { association: "defaultQueue", attributes: ["id", "name"] },
      { association: "defaultTag", attributes: ["id", "name"] },
      { association: "whatsapp", attributes: ["id", "name"] }
    ]
  });

  const bySource: Record<string, ChannelEntryConfig> = {};
  configs.forEach((c) => {
    bySource[c.entrySource] = c;
  });

  return ENTRY_SOURCES.map((entrySource) => ({
    id: bySource[entrySource]?.id ?? null,
    companyId,
    entrySource,
    defaultQueueId: bySource[entrySource]?.defaultQueueId ?? null,
    defaultTagId: bySource[entrySource]?.defaultTagId ?? null,
    whatsappId: bySource[entrySource]?.whatsappId ?? null,
    welcomeMessage: bySource[entrySource]?.welcomeMessage ?? null,
    defaultQueue: bySource[entrySource]?.defaultQueue ?? null,
    defaultTag: bySource[entrySource]?.defaultTag ?? null,
    whatsapp: bySource[entrySource]?.whatsapp ?? null
  }));
};

export default ListChannelEntryConfigsService;
