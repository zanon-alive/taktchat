import Ticket from "../models/Ticket";
import Whatsapp from "../models/Whatsapp";
import logger from "../utils/logger";
import {
  buildFlowMenuInteractive,
  buildFlowMenuText,
  FlowMenuChannel,
  FlowMenuOption
} from "./flowMenuInteractive";
import SendWhatsAppMessageUnified from "../services/WbotServices/SendWhatsAppMessageUnified";
import SendWhatsAppMessage from "../services/WbotServices/SendWhatsAppMessage";

type SendFlowMenuParams = {
  ticket: Ticket;
  message: string;
  options: FlowMenuOption[];
  interactive?: boolean;
};

const resolveMenuChannel = async (ticket: Ticket): Promise<FlowMenuChannel> => {
  const fromInclude = (ticket as Ticket & { whatsapp?: { channelType?: string } })
    .whatsapp?.channelType;
  if (fromInclude === "official" || fromInclude === "baileys") {
    return fromInclude;
  }
  if (!ticket.whatsappId) {
    return "baileys";
  }
  const whatsapp = await Whatsapp.findByPk(ticket.whatsappId, {
    attributes: ["id", "channelType"]
  });
  return whatsapp?.channelType === "official" ? "official" : "baileys";
};

const sendAsText = async (ticket: Ticket, body: string) => {
  try {
    await SendWhatsAppMessageUnified({
      body,
      ticket
    });
  } catch {
    await SendWhatsAppMessage({
      body,
      ticket
    });
  }
};

export const sendFlowMenuWhatsApp = async ({
  ticket,
  message,
  options,
  interactive
}: SendFlowMenuParams): Promise<string> => {
  const channelType = await resolveMenuChannel(ticket);
  const payload = buildFlowMenuInteractive(
    message,
    options,
    interactive,
    channelType
  );
  const fallbackBody = buildFlowMenuText(message, options);
  logger.info(
    `[flowMenu] Canal ${channelType}: menu como ${payload.kind} (${(options || []).length} opções)`
  );

  if (payload.kind === "text") {
    await sendAsText(ticket, payload.body);
    return payload.body;
  }

  try {
    if (payload.kind === "buttons") {
      await SendWhatsAppMessageUnified({
        body: payload.body,
        ticket,
        templateButtons: (payload.buttons || []).map((button, index) => ({
          index: index + 1,
          quickReplyButton: {
            displayText: button.title,
            id: button.id
          }
        }))
      });
      return payload.body;
    }

    await SendWhatsAppMessageUnified({
      body: payload.body,
      ticket,
      listSections: payload.listSections,
      listButtonText: payload.listButtonText
    });
    return payload.body;
  } catch (error: any) {
    logger.warn(
      `[flowMenu] Falha ao enviar menu interativo, usando texto numerado: ${error?.message}`
    );
    await sendAsText(ticket, fallbackBody);
    return fallbackBody;
  }
};
