import { Op } from "sequelize";
import * as Yup from "yup";
import AppError from "../../errors/AppError";
import Chatbot from "../../models/Chatbot";
import Queue from "../../models/Queue";
import ShowQueueService from "./ShowQueueService";
import User from "../../models/User";

interface QueueData {
  name?: string;
  color?: string;
  greetingMessage?: string;
  outOfHoursMessage?: string;
  schedules?: any[];
  chatbots?: Chatbot[];
  orderQueue?: number;
  ativarRoteador?: boolean;
  tempoRoteador: number;
  integrationId?: number | null;
  fileListId?: number | null;
  closeTicket?: boolean;
  autoSendStrategy?: "none" | "on_enter" | "on_request" | "manual";
  confirmationTemplate?: string;
  maxFilesPerSession?: number;
  ragCollection?: string;
}

const UpdateQueueService = async (
  queueId: number | string,
  queueData: QueueData,
  companyId: number
): Promise<Queue> => {
  const { color, name, chatbots } = queueData;

  const queueSchema = Yup.object().shape({
    name: Yup.string()
      .min(2, "ERR_QUEUE_INVALID_NAME")
      .test(
        "Check-unique-name",
        "ERR_QUEUE_NAME_ALREADY_EXISTS",
        async value => {
          if (value) {
            const queueWithSameName = await Queue.findOne({
              where: { name: value, id: { [Op.ne]: queueId }, companyId }
            });

            return !queueWithSameName;
          }
          return true;
        }
      ),
    color: Yup.string()
      .required("ERR_QUEUE_INVALID_COLOR")
      .test("Check-color", "ERR_QUEUE_INVALID_COLOR", async value => {
        if (value) {
          const colorTestRegex = /^#[0-9a-f]{3,6}$/i;
          return colorTestRegex.test(value);
        }
        return true;
      })
      .test(
        "Check-color-exists",
        "ERR_QUEUE_COLOR_ALREADY_EXISTS",
        async value => {
          if (value) {
            const queueWithSameColor = await Queue.findOne({
              where: { color: value, id: { [Op.ne]: queueId }, companyId }
            });
            return !queueWithSameColor;
          }
          return true;
        }
      )
  });

  try {
    await queueSchema.validate({ color, name });
  } catch (err: any) {
    throw new AppError(err.message);
  }

  const queue = await ShowQueueService(queueId, companyId);

  if (queue.companyId !== companyId) {
    throw new AppError("Não é permitido alterar registros de outra empresa");
  }

  if (chatbots) {
    const toNumOrNull = (v: any) => (v === "" || v === undefined || v === null ? null : Number(v));
    await Promise.all(
      chatbots.map(async (bot: any) => {
        const payload = {
          ...(bot.id ? { id: bot.id } : {}),
          name: bot.name ?? "",
          greetingMessage: bot.greetingMessage ?? null,
          queueId: queue.id,
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

    await Promise.all(
      queue.chatbots.map(async oldBot => {
        const stillExists = chatbots.findIndex((bot: any) => bot.id === oldBot.id);

        if (stillExists === -1) {
          await Chatbot.destroy({ where: { id: oldBot.id } });
        }
      })
    );
  }

  const { chatbots: _chatbots, ...queueUpdatePayload } = queueData;
  await queue.update(queueUpdatePayload);

  await queue.reload({
    include: [
      {
        model: Chatbot,
        as: "chatbots",
        include: [
          {
            model: User,
            as: "user"
          },
        ],
        // attributes: ["id", "name", "greetingMessage"],
        order: [[{ model: Chatbot, as: "chatbots" }, "id", "asc"], ["id", "ASC"]]
      }
    ],
    order: [[{ model: Chatbot, as: "chatbots" }, "id", "asc"], ["id", "ASC"]]
  });
  return queue;
};

export default UpdateQueueService;
