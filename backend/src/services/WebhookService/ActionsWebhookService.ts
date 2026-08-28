import AppError from "../../errors/AppError";
import { WebhookModel } from "../../models/Webhook";
import { sendMessageFlow } from "../../controllers/MessageController";
import { IConnections, INodes } from "./DispatchWebHookService";
import { Request, Response } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import { ParsedQs } from "qs";
import CreateContactService from "../ContactServices/CreateContactService";
import Contact from "../../models/Contact";
import CreateTicketService from "../TicketServices/CreateTicketService";
import CreateTicketServiceWebhook from "../TicketServices/CreateTicketServiceWebhook";
import { SendMessage } from "../../helpers/SendMessage";
import GetDefaultWhatsApp from "../../helpers/GetDefaultWhatsApp";
import Ticket from "../../models/Ticket";
import fs from "fs";
import GetWhatsappWbot from "../../helpers/GetWhatsappWbot";
import path from "path";
import SendWhatsAppMedia from "../WbotServices/SendWhatsAppMedia";
import SendWhatsAppMediaFlow, {
  typeSimulation
} from "../WbotServices/SendWhatsAppMediaFlow";
import { randomizarCaminho } from "../../utils/randomizador";
import { SendMessageFlow } from "../../helpers/SendMessageFlow";
import formatBody from "../../helpers/Mustache";
import SetTicketMessagesAsRead from "../../helpers/SetTicketMessagesAsRead";
import SendWhatsAppMessage from "../WbotServices/SendWhatsAppMessage";
import { sendFlowMenuWhatsApp } from "../../helpers/sendFlowMenuWhatsApp";
import {
  resolveFlowMenuPressKey,
  resolveFlowMenuTarget,
  resolveFlowElseTarget
} from "../../helpers/flowMenuInteractive";
import ShowTicketService from "../TicketServices/ShowTicketService";
import CreateMessageService, {
  MessageData
} from "../MessageServices/CreateMessageService";
import { randomString } from "../../utils/randomCode";
import ShowQueueService from "../QueueService/ShowQueueService";
import { getIO } from "../../libs/socket";
import UpdateTicketService from "../TicketServices/UpdateTicketService";
import FindOrCreateATicketTrakingService from "../TicketServices/FindOrCreateATicketTrakingService";
import ShowTicketUUIDService from "../TicketServices/ShowTicketFromUUIDService";
import logger from "../../utils/logger";
import CreateLogTicketService from "../TicketServices/CreateLogTicketService";
import EnsureCompanySettingsService from "../CompaniesSettings/EnsureCompanySettingsService";
import ShowWhatsAppService from "../WhatsappService/ShowWhatsAppService";
import { delay } from "bluebird";
import typebotListener from "../TypebotServices/typebotListener";
import { getWbot } from "../../libs/wbot";
import { proto } from "@whiskeysockets/baileys";
import { handleOpenAi } from "../IntegrationsServices/OpenAiService";
import { IOpenAi } from "../../@types/openai";
import { resolveFlowBuilderMediaPath } from "../../helpers/flowBuilderMediaPath";

interface IAddContact {
  companyId: number;
  name: string;
  phoneNumber: string;
  email?: string;
  dataMore?: any;
}

export const ActionsWebhookService = async (
  whatsappId: number,
  idFlowDb: number,
  companyId: number,
  nodes: INodes[],
  connects: IConnections[],
  nextStage: string,
  dataWebhook: any,
  details: any,
  hashWebhookId: string,
  pressKey?: string,
  idTicket?: number,
  numberPhrase: "" | { number: string; name: string; email: string } = "",
  msg?: proto.IWebMessageInfo
): Promise<string> => {
  try {
    const io = getIO();
    let next = nextStage;
    let createFieldJsonName = "";

    const connectStatic = connects;
    if (numberPhrase === "") {
      const nameInput = details.inputs.find(item => item.keyValue === "nome");
      nameInput.data.split(",").map(dataN => {
        const lineToData = details.keysFull.find(item => item === dataN);
        let sumRes = "";
        if (!lineToData) {
          sumRes = dataN;
        } else {
          sumRes = constructJsonLine(lineToData, dataWebhook);
        }
        createFieldJsonName = createFieldJsonName + sumRes;
      });
    } else {
      createFieldJsonName = numberPhrase.name;
    }

    let numberClient = "";

    if (numberPhrase === "") {
      const numberInput = details.inputs.find(
        item => item.keyValue === "celular"
      );

      numberInput.data.split(",").map(dataN => {
        const lineToDataNumber = details.keysFull.find(item => item === dataN);
        let createFieldJsonNumber = "";
        if (!lineToDataNumber) {
          createFieldJsonNumber = dataN;
        } else {
          createFieldJsonNumber = constructJsonLine(
            lineToDataNumber,
            dataWebhook
          );
        }

        numberClient = numberClient + createFieldJsonNumber;
      });
    } else {
      numberClient = numberPhrase.number;
    }

    numberClient = removerNaoLetrasNumeros(numberClient);

    if (numberClient.substring(0, 2) === "55") {
      if (parseInt(numberClient.substring(2, 4)) >= 31) {
        if (numberClient.length === 13) {
          numberClient =
            numberClient.substring(0, 4) + numberClient.substring(5, 13);
        }
      }
    }

    let createFieldJsonEmail = "";

    if (numberPhrase === "") {
      const emailInput = details.inputs.find(item => item.keyValue === "email");
      emailInput.data.split(",").map(dataN => {
        const lineToDataEmail = details.keysFull.find(item =>
          item.endsWith("email")
        );

        let sumRes = "";
        if (!lineToDataEmail) {
          sumRes = dataN;
        } else {
          sumRes = constructJsonLine(lineToDataEmail, dataWebhook);
        }

        createFieldJsonEmail = createFieldJsonEmail + sumRes;
      });
    } else {
      createFieldJsonEmail = numberPhrase.email;
    }

    const lengthLoop = nodes.length;
    const whatsapp = await GetDefaultWhatsApp(whatsappId, companyId);

    if (whatsapp.status !== "CONNECTED") {
      return;
    }

    let execCount = 0;

    let execFn = "";

    const resolveFlowTicket = async (): Promise<Ticket | null> => {
      if (!idTicket) {
        return null;
      }
      return Ticket.findOne({
        where: { id: idTicket, companyId }
      });
    };

    let ticket = await resolveFlowTicket();
    if (idTicket && !ticket) {
      logger.warn(
        `[flow] Ticket ${idTicket} não encontrado ao iniciar o fluxo ${idFlowDb}`
      );
    }

    let noAlterNext = false;

    for (var i = 0; i < lengthLoop; i++) {
      let nodeSelected: any;
      let ticketInit: Ticket;

      if (pressKey) {
        if (pressKey === "parar") {
          if (idTicket) {
            ticketInit = await Ticket.findOne({
              where: { id: idTicket, whatsappId }
            });
            await (ticketInit || ticket)?.update({
              status: "closed"
            });
          }
          break;
        }

        if (execFn === "") {
          nodeSelected = nodes.filter(node => node.id === next)[0];
        } else {
          nodeSelected = nodes.filter(node => node.id === execFn)[0];
        }
      } else {
        const otherNode = nodes.filter(node => node.id === next)[0];
        if (otherNode) {
          nodeSelected = otherNode;
        }
      }

      if (!nodeSelected) {
        break;
      }
        
      if (nodeSelected.type === "message") {
        
        let msg;
        
        const webhook = ticket?.dataWebhook;

        if (webhook && webhook.hasOwnProperty("variables")) {
          msg = {
            body: replaceMessages(webhook, nodeSelected.data.label)
          };
        } else {
          msg = {
            body: nodeSelected.data.label
          };
        }

        if (ticket) {
          const ticketDetails = await ShowTicketService(ticket.id, companyId);
          await SendWhatsAppMessage({
            body: msg.body,
            ticket: ticketDetails
          });
        } else {
          await SendMessage(whatsapp, {
            number: numberClient,
            body: msg.body
          });
        }
        

        //TESTE BOTÃO
        //await SendMessageFlow(whatsapp, {
        //  number: numberClient,
        //  body: msg.body
        //} )
        await intervalWhats("1");
      }
      if (nodeSelected.type === "typebot") {
        const wbot = getWbot(whatsapp.id);
        await typebotListener({
          wbot: wbot,
          msg,
          ticket,
          typebot: nodeSelected.data.typebotIntegration
        });
      }

      if (nodeSelected.type === "openai") {
        let {
          name,
          prompt,
          voice,
          voiceKey,
          voiceRegion,
          maxTokens,
          temperature,
          apiKey,
          queueId,
          maxMessages
        } = nodeSelected.data.typebotIntegration as IOpenAi;

        let openAiSettings = {
          name,
          prompt,
          voice,
          voiceKey,
          voiceRegion,
          maxTokens,
          temperature,
          apiKey,
          queueId,
          maxMessages
        };

        const contact = await Contact.findOne({
          where: { number: numberClient, companyId }
        });

        const wbot = getWbot(whatsapp.id);

        const ticketTraking = await FindOrCreateATicketTrakingService({
          ticketId: ticket.id,
          companyId,
          userId: null,
          whatsappId: whatsapp?.id
        });

                await handleOpenAi(
  {
    name,
    prompt,
    voice,
    voiceKey,
    voiceRegion,
    model: "gpt-3.5-turbo",
    maxTokens,
    temperature,
    apiKey,
    queueId,
    maxMessages
  },
  msg,
  wbot,
  ticket,
  contact,
  null,
  ticketTraking
);
        await handleOpenAi(undefined,
          msg,
          wbot,
          ticket,
          contact,
          null,
          ticketTraking
        );
      }

      if (nodeSelected.type === "question") {
        const webhook = ticket?.dataWebhook;
        const variables = ticket?.dataWebhook?.variables;

        if (!variables || variables === undefined || variables === null) {
          const { message } = nodeSelected.data.typebotIntegration;
          const ticketDetails = await ShowTicketService(ticket.id, companyId);

          const bodyFila = formatBody(`${message}`, ticket);

          await delay(3000);
          await typeSimulation(ticket, "composing");

          await SendWhatsAppMessage({
            body: bodyFila,
            ticket: ticketDetails,
            quotedMsg: null
          });

          SetTicketMessagesAsRead(ticketDetails);

          await ticketDetails.update({
            lastMessage: bodyFila
          });

          await ticket.update({
            userId: null,
            companyId: companyId,
            lastFlowId: nodeSelected.id,
            hashFlowId: hashWebhookId,
            flowStopped: idFlowDb.toString()
          });
        }
        break;
      }

      if (nodeSelected.type === "ticket") {
        const queueId = nodeSelected.data?.data?.id || nodeSelected.data?.id;
        const queue = await ShowQueueService(queueId, companyId);

        await ticket.update({
          status: "pending",
          queueId: queue.id,
          userId: ticket.userId,
          companyId: companyId,
          flowWebhook: true,
          lastFlowId: nodeSelected.id,
          hashFlowId: hashWebhookId,
          flowStopped: idFlowDb.toString()
        });

        await FindOrCreateATicketTrakingService({
          ticketId: ticket.id,
          companyId,
          whatsappId: ticket.whatsappId,
          userId: ticket.userId
        });

        await UpdateTicketService({
          ticketData: {
            status: "pending",
            queueId: queue.id
          },
          ticketId: ticket.id,
          companyId
        });

        await CreateLogTicketService({
          ticketId: ticket.id,
          type: "queue",
          queueId: queue.id
        });

        const { settings } = await EnsureCompanySettingsService({ companyId });

        const enableQueuePosition = settings.sendQueuePosition === "enabled";

        if (enableQueuePosition) {
          const count = await Ticket.findAndCountAll({
            where: {
              userId: null,
              status: "pending",
              companyId,
              queueId: queue.id,
              whatsappId: whatsapp.id,
              isGroup: false
            }
          });

          // Lógica para enviar posição da fila de atendimento
          const qtd = count.count === 0 ? 1 : count.count;
          const queuePositionLabel = (settings.sendQueuePositionMessage?.trim?.() || "").length > 0
            ? settings.sendQueuePositionMessage
            : "{{ms}} *{{name}}*, sua posição na fila de atendimento é";
          const msgFila = `${queuePositionLabel} *${qtd}*`;

          const ticketDetails = await ShowTicketService(ticket.id, companyId);

          const bodyFila = formatBody(`${msgFila}`, ticket);

          await delay(3000);
          await typeSimulation(ticket, "composing");

          await SendWhatsAppMessage({
            body: bodyFila,
            ticket: ticketDetails,
            quotedMsg: null
          });

          SetTicketMessagesAsRead(ticketDetails);

          await ticketDetails.update({
            lastMessage: bodyFila
          });
        }
      }

      if (nodeSelected.type === "singleBlock") {
        for (var iLoc = 0; iLoc < nodeSelected.data.seq.length; iLoc++) {
          const elementNowSelected = nodeSelected.data.seq[iLoc];

          ticket = await Ticket.findOne({
            where: { id: idTicket, companyId }
          });

          if (elementNowSelected.includes("message")) {
            const bodyFor = nodeSelected.data.elements.filter(
              item => item.number === elementNowSelected
            )[0].value;

            const ticketDetails = await ShowTicketService(idTicket, companyId);

            let msg;

            const webhook = ticket?.dataWebhook;

            if (webhook && webhook.hasOwnProperty("variables")) {
              msg = replaceMessages(webhook.variables, bodyFor);
            } else {
              msg = bodyFor;
            }

            await delay(3000);
            await typeSimulation(ticket, "composing");

            await SendWhatsAppMessage({
              body: msg,
              ticket: ticketDetails,
              quotedMsg: null
            });

            SetTicketMessagesAsRead(ticketDetails);

            await ticketDetails.update({
              lastMessage: formatBody(bodyFor, ticket)
            });

            await intervalWhats("1");
          }
          if (elementNowSelected.includes("interval")) {
            await intervalWhats(
              nodeSelected.data.elements.filter(
                item => item.number === elementNowSelected
              )[0].value
            );
          }

          if (elementNowSelected.includes("img")) {
            await typeSimulation(ticket, "composing");
            const storedName = nodeSelected.data.elements.filter(
              item => item.number === elementNowSelected
            )[0]?.value;
            const mediaPath = resolveFlowBuilderMediaPath(
              storedName,
              companyId
            );
            if (!mediaPath) {
              logger.warn(
                `[flow] Imagem do Conteúdo não encontrada: ${storedName} company=${companyId}`
              );
            } else {
              try {
                const ticketDetails = await ShowTicketService(
                  ticket?.id || idTicket,
                  companyId
                );
                logger.info(
                  `[flow] Enviando imagem do Conteúdo ticket=${ticketDetails.id} file=${path.basename(mediaPath)}`
                );
                await SendWhatsAppMedia({
                  media: {
                    originalname: path.basename(mediaPath),
                    mimetype:
                      path.extname(mediaPath).toLowerCase() === ".png"
                        ? "image/png"
                        : "image/jpeg",
                    filename: path.basename(mediaPath),
                    path: mediaPath
                  } as Express.Multer.File,
                  ticket: ticketDetails,
                  body: ""
                });
              } catch (err) {
                logger.error(err);
              }
            }
            await intervalWhats("1");
          }

          if (elementNowSelected.includes("audio")) {
            const storedName = nodeSelected.data.elements.filter(
              item => item.number === elementNowSelected
            )[0]?.value;
            const mediaDirectory = resolveFlowBuilderMediaPath(
              storedName,
              companyId
            );
            const ticketInt = await Ticket.findOne({
              where: { id: ticket.id }
            });

            await typeSimulation(ticket, "recording");

            if (!mediaDirectory) {
              logger.warn(
                `[flow] Áudio do Conteúdo não encontrado: ${storedName} company=${companyId}`
              );
            } else {
              try {
                await SendWhatsAppMediaFlow({
                  media: mediaDirectory,
                  ticket: ticketInt,
                  isRecord: nodeSelected.data.elements.filter(
                    item => item.number === elementNowSelected
                  )[0].record
                });
              } catch (err) {
                logger.error(err);
              }
            }
            await intervalWhats("1");
          }
          if (elementNowSelected.includes("video")) {
            const storedName = nodeSelected.data.elements.filter(
              item => item.number === elementNowSelected
            )[0]?.value;
            const mediaDirectory = resolveFlowBuilderMediaPath(
              storedName,
              companyId
            );
            const ticketInt = await Ticket.findOne({
              where: { id: ticket.id }
            });

            await typeSimulation(ticket, "recording");

            if (!mediaDirectory) {
              logger.warn(
                `[flow] Vídeo do Conteúdo não encontrado: ${storedName} company=${companyId}`
              );
            } else {
              try {
                await SendWhatsAppMediaFlow({
                  media: mediaDirectory,
                  ticket: ticketInt
                });
              } catch (err) {
                logger.error(err);
              }
            }
            await intervalWhats("1");
          }
        }
      }

      let isRandomizer: boolean;
      if (nodeSelected.type === "randomizer") {
        const selectedRandom = randomizarCaminho(
          nodeSelected.data.percent / 100
        );

        const resultConnect = connects.filter(
          connect => connect.source === nodeSelected.id
        );
        if (selectedRandom === "A") {
          next = resultConnect.filter(item => item.sourceHandle === "a")[0]
            .target;
          noAlterNext = true;
        } else {
          next = resultConnect.filter(item => item.sourceHandle === "b")[0]
            .target;
          noAlterNext = true;
        }
        isRandomizer = true;
      }

      let isMenu: boolean;

      if (nodeSelected.type === "menu") {
        let sendMenu = !pressKey;
        if (pressKey) {
          pressKey = resolveFlowMenuPressKey(
            pressKey,
            nodeSelected.data?.arrayOption || [],
            msg
          );
          execFn =
            resolveFlowMenuTarget(connectStatic, next, pressKey) ||
            resolveFlowElseTarget(connectStatic, next);
          if (!execFn) {
            logger.info(
              `[flow] Opção "${pressKey}" não encontrada no menu ${nodeSelected.id}, reenviando opções`
            );
            sendMenu = true;
            pressKey = undefined;
          } else {
            pressKey = "999";
            isMenu = true;
          }
        }
        if (sendMenu) {
          if (!ticket) {
            ticket = await resolveFlowTicket();
          }
          if (!ticket) {
            logger.warn(
              `[flow] Sem ticket para enviar o menu no nó ${nodeSelected.id}`
            );
            break;
          }
          const ticketDetails = await ShowTicketService(ticket.id, companyId);
          const webhook = ticket?.dataWebhook;
          const menuMessage =
            webhook && webhook.hasOwnProperty("variables")
              ? replaceMessages(webhook.variables, nodeSelected.data?.message)
              : nodeSelected.data?.message;

          await typeSimulation(ticket, "composing");

          const sentBody = await sendFlowMenuWhatsApp({
            ticket: ticketDetails,
            message: menuMessage,
            options: nodeSelected.data?.arrayOption || [],
            interactive: nodeSelected.data?.interactive
          });

          SetTicketMessagesAsRead(ticketDetails);

          await ticketDetails.update({
            lastMessage: formatBody(sentBody, ticket)
          });
          await intervalWhats("1");

          if (ticket) {
            const reloaded = await Ticket.findOne({
              where: {
                id: ticket.id,
                companyId: companyId
              }
            });
            if (reloaded) {
              ticket = reloaded;
            }
          } else {
            ticket = await resolveFlowTicket();
          }

          if (ticket) {
            await ticket.update({
              queueId: ticket.queueId ? ticket.queueId : null,
              userId: null,
              companyId: companyId,
              flowWebhook: true,
              lastFlowId: nodeSelected.id,
              dataWebhook: dataWebhook,
              hashFlowId: hashWebhookId,
              flowStopped: idFlowDb.toString()
            });
          }

          break;
        }
      }

      let isContinue = false;

      if (pressKey === "999" && execCount > 0) {
        pressKey = undefined;
        let result = connects.filter(connect => connect.source === execFn)[0];
        if (typeof result === "undefined") {
          next = "";
        } else {
          if (!noAlterNext) {
            next = result.target;
          }
        }
      } else {
        let result;

        if (isMenu) {
          result = { target: execFn };
          isContinue = true;
          pressKey = undefined;
        } else if (isRandomizer) {
          isRandomizer = false;
          result = next;
        } else {
          result = connects.filter(connect => connect.source === next)[0];
        }

        if (typeof result === "undefined") {
          next = "";
        } else {
          if (!noAlterNext) {
            next = result.target;
          }
        }
      }

      if (!pressKey && !isContinue) {
        const nextNode = connects.filter(
          connect => connect.source === nodeSelected.id
        ).length;

        if (nextNode === 0) {

          if (!ticket) {
            ticket = await resolveFlowTicket();
          }
          if (ticket) {
            await ticket.update({
              lastFlowId: nodeSelected.id,
              hashFlowId: null,
              flowWebhook: false,
              flowStopped: idFlowDb.toString()
            });
          }
          break;
        }
      }

      isContinue = false;

      if (next === "") {
        break;
      }

      if (!ticket) {
        ticket = await resolveFlowTicket();
      }
      if (!ticket) {
        logger.warn(
          `[flow] Sem ticket para persistir lastFlowId no nó ${nodeSelected?.id}`
        );
        continue;
      }
      await ticket.update({
        userId: null,
        companyId: companyId,
        flowWebhook: true,
        lastFlowId: nodeSelected.id,
        hashFlowId: hashWebhookId,
        flowStopped: idFlowDb.toString()
      });

      noAlterNext = false;
      execCount++;
    }

    return "ds";
  } catch (error) {
    logger.error(error);
  }
};

const constructJsonLine = (line: string, json: any) => {
  let valor = json;
  const chaves = line.split(".");

  if (chaves.length === 1) {
    return valor[chaves[0]];
  }

  for (const chave of chaves) {
    valor = valor[chave];
  }
  return valor;
};

function removerNaoLetrasNumeros(texto: string) {
  return texto.replace(/[^a-zA-Z0-9]/g, "");
}

const sendMessageWhats = async (
  whatsId: number,
  msg: any,
  req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>
) => {
  sendMessageFlow(whatsId, msg, req);
  return Promise.resolve();
};

const intervalWhats = (time: string) => {
  const seconds = parseInt(time) * 1000;
  return new Promise(resolve => setTimeout(resolve, seconds));
};

const replaceMessages = (variables, message) => {
  return message.replace(
    /{{\s*([^{}\s]+)\s*}}/g,
    (match, key) => variables[key] || ""
  );
};

const replaceMessagesOld = (
  message: string,
  details: any,
  dataWebhook: any,
  dataNoWebhook?: any
) => {
  const matches = message.match(/\{([^}]+)\}/g);

  if (dataWebhook) {
    let newTxt = message.replace(/{+nome}+/, dataNoWebhook.nome);
    newTxt = newTxt.replace(/{+numero}+/, dataNoWebhook.numero);
    newTxt = newTxt.replace(/{+email}+/, dataNoWebhook.email);
    return newTxt;
  }

  if (matches && matches.includes("inputs")) {
    const placeholders = matches.map(match => match.replace(/\{|\}/g, ""));
    let newText = message;
    placeholders.map(item => {
      const value = details["inputs"].find(
        itemLocal => itemLocal.keyValue === item
      );
      const lineToData = details["keysFull"].find(itemLocal =>
        itemLocal.endsWith(`.${value.data}`)
      );
      const createFieldJson = constructJsonLine(lineToData, dataWebhook);
      newText = newText.replace(`{${item}}`, createFieldJson);
    });
    return newText;
  } else {
    return message;
  }
};