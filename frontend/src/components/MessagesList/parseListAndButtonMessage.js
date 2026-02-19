/**
 * Parseia o body de mensagens [BUTTON] e [LIST] geradas pelo backend (wbotMessageListener).
 * Retorna estrutura tipada para exibição em ButtonMessagePreview e ListMessagePreview.
 */

/**
 * Linha de botão: *buttonId* - displayText
 * @param {string} line
 * @returns {{ id: string, label: string } | null}
 */
function parseButtonLine(line) {
  const trimmed = line.trim();
  const match = trimmed.match(/^\*([^*]*)\*\s*-\s*(.+)$/);
  if (!match) return null;
  return { id: match[1].trim(), label: match[2].trim() };
}

/**
 * Remove prefixo "Sem titulo" do título da opção (quando o backend junta sem newline).
 * @param {string} rowTitle
 * @returns {string}
 */
function normalizeRowTitle(rowTitle) {
  if (!rowTitle || typeof rowTitle !== "string") return rowTitle || "";
  const cleaned = rowTitle.replace(/^sem\s+titulo\s*/i, "").trim();
  return cleaned || rowTitle;
}

/**
 * Linha de item de lista: rowTitle - rowDescription - rowId
 * @param {string} line
 * @returns {{ title: string, description: string, id: string } | null}
 */
function parseListRowLine(line) {
  const trimmed = line.trim();
  const parts = trimmed.split(/\s*-\s*/);
  if (parts.length < 3) return null;
  const title = normalizeRowTitle(parts[0].trim());
  const id = parts[parts.length - 1].trim();
  const description = parts.slice(1, -1).join(" - ").trim();
  return { title, description, id };
}

/**
 * Verifica se a linha parece título de seção (ex.: *Sem titulo* ou *Algum título*).
 */
function isSectionTitleLine(line) {
  return /^\*[^*]*\*\s*$/.test(line.trim()) || /^\*[^*]*\*\*?\s*$/.test(line.trim());
}

/**
 * Parseia mensagem [BUTTON].
 * Formato: [BUTTON]\n\n*contentText*\n\n*id* - label\n*id* - label\n...
 * @param {string} body
 * @returns {{ type: 'button', contentText: string, buttons: Array<{ id: string, label: string }> } | null}
 */
export function parseButtonMessage(body) {
  if (!body || typeof body !== "string") return null;
  const raw = body.trim();
  if (!raw.startsWith("[BUTTON]")) return null;

  const lines = raw.split(/\r?\n/).map((l) => l.trimEnd());
  const rest = lines.slice(1).filter((l) => l.length > 0);

  const contentLines = [];
  const buttons = [];
  let phase = "content";

  for (const line of rest) {
    const button = parseButtonLine(line);
    if (button) {
      phase = "buttons";
      buttons.push(button);
    } else if (phase === "content") {
      contentLines.push(line);
    } else if (phase === "buttons") {
      const again = parseButtonLine(line);
      if (again) buttons.push(again);
    }
  }

  const contentText = contentLines.join("\n").trim();
  return {
    type: "button",
    contentText: contentText || "",
    buttons,
  };
}

/**
 * Parseia mensagem [LIST].
 * Formato: [LIST]\n\n*título*\n*descrição*\n\nfooter\n\n*sectionTitle*\nrowTitle - rowDescription - rowId\n...
 * @param {string} body
 * @returns {{ type: 'list', title?: string, description?: string, footer?: string, sections: Array<{ title?: string, rows: Array<{ title: string, description: string, id: string }> }> } | null}
 */
export function parseListMessage(body) {
  if (!body || typeof body !== "string") return null;
  const raw = body.trim();
  if (!raw.startsWith("[LIST]")) return null;

  const lines = raw.split(/\r?\n/).map((l) => l.trimEnd());
  const rest = lines.slice(1);

  const sections = [];
  let currentSection = { title: undefined, rows: [] };
  let headerDone = false;
  let title = undefined;
  let description = undefined;
  let footerLines = [];

  const pushSection = () => {
    if (currentSection.rows.length > 0 || currentSection.title !== undefined) {
      sections.push({ ...currentSection });
    }
    currentSection = { title: undefined, rows: [] };
  };

  for (let i = 0; i < rest.length; i++) {
    const line = rest[i];
    const trimmed = line.trim();

    if (trimmed.length === 0) {
      if (currentSection.rows.length > 0) {
        pushSection();
      }
      continue;
    }

    const row = parseListRowLine(line);
    if (row) {
      headerDone = true;
      currentSection.rows.push(row);
      continue;
    }

    if (isSectionTitleLine(line)) {
      const sectionTitle = trimmed.replace(/\*+/g, "").trim();
      if (headerDone || sections.length > 0 || currentSection.rows.length > 0) {
        pushSection();
      }
      currentSection.title = sectionTitle.toLowerCase() === "sem titulo" ? undefined : sectionTitle;
      headerDone = true;
      continue;
    }

    const unstripped = trimmed.replace(/\*+/g, "").trim();
    const isSemTitulo = unstripped.toLowerCase() === "sem titulo";

    if (isSemTitulo && description !== undefined && !headerDone) {
      pushSection();
      currentSection.title = undefined;
      headerDone = true;
      continue;
    }

    if (!headerDone) {
      if (title === undefined && unstripped.length > 0) {
        if (!isSemTitulo) title = unstripped;
      } else if (description === undefined && unstripped.length > 0) {
        description = unstripped;
      } else if (description !== undefined && unstripped.length > 0) {
        footerLines.push(unstripped);
      }
    } else {
      footerLines.push(unstripped);
    }
  }

  pushSection();

  const footer = footerLines.filter((l) => l.length > 0).join("\n") || undefined;
  if (sections.length === 0 && !title && !description && !footer) {
    return null;
  }

  return {
    type: "list",
    title,
    description,
    footer,
    sections,
  };
}

/**
 * Entrada única: detecta [BUTTON] ou [LIST] e retorna o objeto parseado ou null.
 * @param {string} body
 * @returns {{ type: 'button', contentText: string, buttons: Array } | { type: 'list', title?: string, description?: string, footer?: string, sections: Array } | null}
 */
export function parseInteractiveBody(body) {
  if (!body || typeof body !== "string") return null;
  const raw = body.trimStart();
  if (raw.startsWith("[BUTTON]")) return parseButtonMessage(body);
  if (raw.startsWith("[LIST]")) return parseListMessage(body);
  return null;
}
