import AppError from "../../errors/AppError";
import Chatbot from "../../models/Chatbot";

interface ChatbotData {
  id?: number;
  name?: string;
  greetingMessage?: string;
  options?: Chatbot[];
  closeTicket?: boolean;
  optQueueId?: number | string | null;
}

const UpdateChatBotServices = async (
  chatBotId: number | string,
  chatbotData: ChatbotData
): Promise<Chatbot> => {
  const { options, ...rest } = chatbotData;

  const chatbot = await Chatbot.findOne({
    where: { id: chatBotId },
    include: [{ model: Chatbot, as: "options" }]
  });

  if (!chatbot) {
    throw new AppError("ERR_NO_CHATBOT_FOUND", 404);
  }

  if (options && Array.isArray(options)) {
    const toNumOrNull = (v: any) => (v === "" || v === undefined || v === null ? null : Number(v));
    await Promise.all(
      options.map(async (bot: any) => {
        const payload = {
          ...(bot.id ? { id: bot.id } : {}),
          name: bot.name ?? "",
          greetingMessage: bot.greetingMessage ?? null,
          chatbotId: chatbot.id,
          queueType: bot.queueType ?? "text",
          optQueueId: toNumOrNull(bot.optQueueId),
          optUserId: toNumOrNull(bot.optUserId),
          optIntegrationId: toNumOrNull(bot.optIntegrationId),
          optFileId: toNumOrNull(bot.optFileId),
          closeTicket: !!bot.closeTicket,
        };
        await Chatbot.upsert(payload);
      })
    );

    const existingOptions = (chatbot as any).options || [];
    await Promise.all(
      existingOptions.map(async (oldBot: Chatbot) => {
        const stillExists = options.findIndex((bot: any) => bot.id === oldBot.id);
        if (stillExists === -1) {
          await Chatbot.destroy({ where: { id: oldBot.id } });
        }
      })
    );
  }

  const updatePayload = {
    name: rest.name ?? (chatbot as any).name,
    greetingMessage: rest.greetingMessage !== undefined ? rest.greetingMessage : (chatbot as any).greetingMessage,
    closeTicket: rest.closeTicket !== undefined ? !!rest.closeTicket : (chatbot as any).closeTicket,
    optQueueId: rest.optQueueId === "" || rest.optQueueId === undefined || rest.optQueueId === null
      ? null
      : Number(rest.optQueueId),
  };
  await chatbot.update(updatePayload);

  await chatbot.reload({
    include: [
      {
        model: Chatbot,
        as: "options",
        attributes: ["id", "name", "greetingMessage", "queueType", "optIntegrationId", "optQueueId", "optUserId", "optFileId", "closeTicket"]
      }
    ]
  });

  return chatbot;
};

export default UpdateChatBotServices;
