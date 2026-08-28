export type FlowMenuOption = {
  number: number | string;
  value: string;
};

export type FlowMenuInteractiveKind = "buttons" | "list" | "text";

export type FlowMenuChannel = "baileys" | "official";

export type FlowMenuInteractivePayload = {
  kind: FlowMenuInteractiveKind;
  body: string;
  buttons?: Array<{ id: string; title: string }>;
  listSections?: Array<{
    title: string;
    rows: Array<{ id: string; title: string; description?: string }>;
  }>;
  listButtonText?: string;
};

export const FLOW_MENU_BUTTON_MAX = 3;
export const FLOW_MENU_LIST_MAX = 10;
export const FLOW_MENU_BUTTON_TITLE_MAX = 20;
export const FLOW_MENU_LIST_TITLE_MAX = 24;

const truncate = (value: string, max: number): string => {
  const text = (value || "").trim();
  if (text.length <= max) {
    return text || "Opção";
  }
  return `${text.slice(0, max - 1)}…`;
};

export const buildFlowMenuText = (
  message: string,
  options: FlowMenuOption[]
): string => {
  const lines = (options || [])
    .map(option => `[${option.number}] ${option.value}`)
    .join("\n");
  const header = (message || "").trim();
  if (!header) {
    return lines;
  }
  if (!lines) {
    return header;
  }
  return `${header}\n\n${lines}`;
};

export const shouldSendFlowMenuInteractive = (
  interactive: boolean | undefined,
  optionCount: number,
  channelType?: FlowMenuChannel
): boolean => {
  if (interactive === false) {
    return false;
  }
  // Baileys: o WhatsApp costuma cortar botões/listas e entregar só o título.
  if (channelType === "baileys") {
    return false;
  }
  return optionCount > 0 && optionCount <= FLOW_MENU_LIST_MAX;
};

export const buildFlowMenuInteractive = (
  message: string,
  options: FlowMenuOption[],
  interactive?: boolean,
  channelType?: FlowMenuChannel
): FlowMenuInteractivePayload => {
  const list = options || [];
  const body = (message || "").trim() || "Escolha uma opção:";

  if (!shouldSendFlowMenuInteractive(interactive, list.length, channelType)) {
    return {
      kind: "text",
      body: buildFlowMenuText(message, list)
    };
  }

  if (list.length <= FLOW_MENU_BUTTON_MAX) {
    return {
      kind: "buttons",
      body,
      buttons: list.map(option => ({
        id: String(option.number),
        title: truncate(String(option.value || `Opção ${option.number}`), FLOW_MENU_BUTTON_TITLE_MAX)
      }))
    };
  }

  return {
    kind: "list",
    body,
    listButtonText: "Escolher",
    listSections: [
      {
        title: "Opções",
        rows: list.map(option => ({
          id: String(option.number),
          title: truncate(String(option.value || `Opção ${option.number}`), FLOW_MENU_LIST_TITLE_MAX)
        }))
      }
    ]
  };
};

const parseNativeFlowReplyId = (msg: any): string | undefined => {
  const paramsJson =
    msg?.message?.interactiveResponseMessage?.nativeFlowResponseMessage?.paramsJson ||
    msg?.message?.viewOnceMessage?.message?.interactiveResponseMessage
      ?.nativeFlowResponseMessage?.paramsJson;

  if (!paramsJson || typeof paramsJson !== "string") {
    return undefined;
  }

  try {
    const parsed = JSON.parse(paramsJson);
    if (parsed?.id != null) {
      return String(parsed.id);
    }
  } catch {
    return undefined;
  }

  return undefined;
};

export const extractInteractiveReplyId = (msg?: any): string | undefined => {
  if (!msg) {
    return undefined;
  }

  const candidates = [
    msg?.message?.buttonsResponseMessage?.selectedButtonId,
    msg?.message?.listResponseMessage?.singleSelectReply?.selectedRowId,
    msg?.message?.templateButtonReplyMessage?.selectedId,
    msg?.interactive?.button_reply?.id,
    msg?.interactive?.list_reply?.id,
    parseNativeFlowReplyId(msg)
  ];

  const found = candidates.find(value => value != null && String(value).trim() !== "");
  return found != null ? String(found).trim() : undefined;
};

export const resolveFlowMenuPressKey = (
  pressKey: string | undefined,
  options: FlowMenuOption[],
  msg?: any
): string | undefined => {
  const list = options || [];
  const raw = (extractInteractiveReplyId(msg) || pressKey || "").trim();
  if (!raw) {
    return pressKey;
  }

  const byNumber = list.find(option => String(option.number) === raw);
  if (byNumber) {
    return String(byNumber.number);
  }

  const normalized = raw.toLowerCase();
  const byValue = list.find(
    option => String(option.value || "").trim().toLowerCase() === normalized
  );
  if (byValue) {
    return String(byValue.number);
  }

  const byTruncatedTitle = list.find(option => {
    const title = truncate(String(option.value || ""), FLOW_MENU_BUTTON_TITLE_MAX).toLowerCase();
    const listTitle = truncate(String(option.value || ""), FLOW_MENU_LIST_TITLE_MAX).toLowerCase();
    return title === normalized || listTitle === normalized;
  });
  if (byTruncatedTitle) {
    return String(byTruncatedTitle.number);
  }

  return raw;
};

export const FLOW_ELSE_HANDLE = "aelse";

export const resolveFlowHandleTarget = (
  connections: Array<{
    source?: string;
    sourceHandle?: string | null;
    target?: string;
  }>,
  nodeId: string | undefined,
  handleId: string | undefined
): string | undefined => {
  if (!nodeId || handleId == null || String(handleId).trim() === "") {
    return undefined;
  }
  const handle = String(handleId).trim();
  const match = (connections || []).find(
    connection =>
      connection.source === nodeId && connection.sourceHandle === handle
  );
  return match?.target;
};

export const resolveFlowElseTarget = (
  connections: Array<{
    source?: string;
    sourceHandle?: string | null;
    target?: string;
  }>,
  nodeId: string | undefined
): string | undefined => {
  return resolveFlowHandleTarget(connections, nodeId, FLOW_ELSE_HANDLE);
};

export const resolveFlowMenuTarget = (
  connections: Array<{
    source?: string;
    sourceHandle?: string | null;
    target?: string;
  }>,
  menuId: string | undefined,
  pressKey: string | undefined
): string | undefined => {
  if (!menuId || pressKey == null || String(pressKey).trim() === "") {
    return undefined;
  }
  const handle = String(pressKey).trim();
  const match = (connections || []).find(
    connection =>
      connection.source === menuId &&
      (connection.sourceHandle === `a${handle}` ||
        connection.sourceHandle === handle)
  );
  return match?.target;
};
