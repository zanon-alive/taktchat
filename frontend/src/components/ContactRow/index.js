import React, { memo, useCallback } from "react";
import { CheckCircle, Ban } from "lucide-react";
import { WhatsApp, Edit as EditIcon, DeleteOutline as DeleteOutlineIcon, Lock as LockIcon } from "@material-ui/icons";
import { Unlock } from "lucide-react";
import { Tooltip, IconButton } from "@material-ui/core";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import LazyContactAvatar from "../LazyContactAvatar";

const useStyles = makeStyles((theme) => ({
  row: {
    borderBottom: `1px solid ${theme.palette.divider}`,
    cursor: "pointer",
  },
  rowSelected: {
    backgroundColor: theme.palette.primary?.main ? `${theme.palette.primary.main}15` : "rgba(37, 99, 235, 0.08)",
  },
  cellCheckbox: {
    width: 48,
    minWidth: 48,
    padding: theme.spacing(1.5),
  },
  checkbox: {
    width: 16,
    height: 16,
    accentColor: theme.palette.primary?.main || "#2563eb",
  },
  cellName: {
    paddingLeft: 0,
    paddingRight: theme.spacing(1.5),
    paddingTop: theme.spacing(1.5),
    paddingBottom: theme.spacing(1.5),
    minWidth: 200,
  },
  nameCellInner: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1.5),
    minWidth: 0,
    whiteSpace: "nowrap",
  },
  avatarWrapper: {
    width: 40,
    height: 40,
    flexShrink: 0,
    borderRadius: "50%",
    backgroundColor: theme.palette.grey[300],
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  nameText: {
    flex: 1,
    minWidth: 0,
    fontWeight: 500,
    color: theme.palette.text.primary,
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  cellPhone: {
    padding: theme.spacing(1.5),
    minWidth: 140,
  },
  phoneCellInner: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(0.75),
    whiteSpace: "nowrap",
  },
  phoneText: {
    flex: 1,
    minWidth: 0,
    fontSize: "1rem",
    lineHeight: 1.25,
    color: theme.palette.text.primary,
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  iconValid: {
    width: 20,
    height: 20,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    color: theme.palette.success?.main || "#16a34a",
  },
  iconInvalidWrapper: {
    width: 20,
    height: 20,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    borderRadius: "50%",
    backgroundColor: theme.palette.error?.light || "#fef2f2",
    padding: 2,
  },
  iconInvalid: {
    color: theme.palette.error?.main || "#dc2626",
  },
  cellEmail: {
    padding: theme.spacing(1.5),
    width: 120,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    [theme.breakpoints.down("lg")]: {
      display: "none",
    },
  },
  truncateText: {
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    maxWidth: "100%",
    fontSize: "0.75rem",
  },
  textMuted: {
    color: theme.palette.text.secondary,
  },
  cellCity: {
    padding: theme.spacing(1.5),
    maxWidth: 120,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  cellTags: {
    padding: theme.spacing(1.5),
    minWidth: 80,
    maxWidth: 200,
  },
  tagsWrapper: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 4,
  },
  tagChip: {
    display: "inline-flex",
    alignItems: "center",
    padding: "2px 8px",
    borderRadius: 9999,
    fontSize: "0.7rem",
    fontWeight: 600,
    maxWidth: 120,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  tagMore: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: 16,
    height: 16,
    fontSize: "10px",
    fontWeight: 600,
    color: theme.palette.common.white,
    backgroundColor: theme.palette.grey[600],
    borderRadius: "50%",
    flexShrink: 0,
  },
  cellStatus: {
    padding: theme.spacing(1.5),
    textAlign: "center",
    width: 80,
    minWidth: 80,
  },
  statusChip: {
    display: "inline-flex",
    padding: theme.spacing(0.25, 1),
    fontSize: "0.75rem",
    fontWeight: 600,
    borderRadius: 9999,
  },
  statusAtivo: {
    backgroundColor: theme.palette.success?.light || "#dcfce7",
    color: theme.palette.success?.dark || "#166534",
  },
  statusInativo: {
    backgroundColor: theme.palette.error?.light || "#fee2e2",
    color: theme.palette.error?.dark || "#991b1b",
  },
  statusSuspenso: {
    backgroundColor: theme.palette.grey[300],
    color: theme.palette.grey[800],
  },
  statusDefault: {
    backgroundColor: theme.palette.grey[400],
    color: theme.palette.grey[900],
  },
  cellActions: {
    padding: theme.spacing(1.5),
    textAlign: "right",
    width: 180,
    minWidth: 180,
    whiteSpace: "nowrap",
  },
  actionsInner: {
    display: "flex",
    flexWrap: "nowrap",
    justifyContent: "center",
    alignItems: "center",
    gap: 4,
  },
}));

const ContactRow = memo(({
  contact,
  selectedContactIds,
  onToggleSelect,
  onEdit,
  onSendMessage,
  onDelete,
  onBlock,
  onUnblock,
  formatPhoneNumber,
  CustomTooltipProps,
  rowStyle,
  rowIndex
}) => {
  const theme = useTheme();
  const classes = useStyles();
  const isSelected = selectedContactIds.includes(contact.id);

  const rowClassName = [classes.row, isSelected && classes.rowSelected].filter(Boolean).join(" ");

  const getTextColor = (backgroundColor) => {
    if (!backgroundColor) return "#000000";
    let hex = backgroundColor.replace("#", "");
    if (hex.length === 3) hex = hex.split("").map((c) => c + c).join("");
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? "#000000" : "#FFFFFF";
  };

  const normalizeTags = (raw) => {
    try {
      let arr = [];
      if (Array.isArray(raw)) arr = raw;
      else if (Array.isArray(raw?.tags)) arr = raw.tags;
      else if (Array.isArray(raw?.tags?.rows)) arr = raw.tags.rows;
      else if (Array.isArray(raw?.rows)) arr = raw.rows;
      if (!arr || arr.length === 0) return [];
      return arr.map((t, idx) => {
        if (!t || typeof t !== "object") return null;
        const obj = t;
        const nested = obj.tag || obj.Tag || obj.Tags || {};
        const name = obj.name || nested.name || obj.label;
        if (!name) return null;
        const color = obj.color || nested.color || obj.hex || "#9CA3AF";
        const id = obj.tagId ?? obj.id ?? nested.id ?? `tag-${contact.id}-${idx}`;
        return { id, name, color };
      }).filter(Boolean);
    } catch {
      return [];
    }
  };

  const rawTags = contact.tags || contact.contactTags || [];
  const tags = normalizeTags(rawTags);

  const statusClass = contact.situation === "Ativo"
    ? classes.statusAtivo
    : contact.situation === "Inativo"
      ? classes.statusInativo
      : contact.situation === "Suspenso"
        ? classes.statusSuspenso
        : classes.statusDefault;

  const handleRowClick = useCallback(
    (e) => {
      if (e.target.closest("[data-skip-row-click]")) {
        return;
      }
      onEdit(contact.id);
    },
    [contact.id, onEdit]
  );

  return (
    <tr style={rowStyle} className={rowClassName} onClick={handleRowClick} title="Clique para editar contato">
      <td className={classes.cellCheckbox} data-skip-row-click>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => onToggleSelect(contact.id, rowIndex, e)}
          className={classes.checkbox}
        />
      </td>
      <td className={classes.cellName}>
        <div className={classes.nameCellInner}>
          <Tooltip {...CustomTooltipProps} title={contact.name || "Sem nome"}>
            <div className={classes.avatarWrapper}>
              <LazyContactAvatar contact={contact} style={{ width: 40, height: 40 }} />
            </div>
          </Tooltip>
          <Tooltip {...CustomTooltipProps} title={contact.name || "Sem nome"}>
            <span className={classes.nameText}>{contact.name || "Sem nome"}</span>
          </Tooltip>
        </div>
      </td>
      <td className={classes.cellPhone}>
        <div className={classes.phoneCellInner}>
          <span className={classes.phoneText}>{formatPhoneNumber(contact.number)}</span>
          {!!contact.isWhatsappValid ? (
            <Tooltip {...CustomTooltipProps} title={`WhatsApp válido${contact.validatedAt ? ` • ${new Date(contact.validatedAt).toLocaleString("pt-BR")}` : ""}`}>
              <div className={classes.iconValid}>
                <CheckCircle style={{ width: 20, height: 20, strokeWidth: 2.5 }} />
              </div>
            </Tooltip>
          ) : (
            <Tooltip {...CustomTooltipProps} title={`WhatsApp inválido${contact.validatedAt ? ` • ${new Date(contact.validatedAt).toLocaleString("pt-BR")}` : ""}`}>
              <div className={classes.iconInvalidWrapper}>
                <Ban className={classes.iconInvalid} style={{ width: 16, height: 16, strokeWidth: 2.5 }} />
              </div>
            </Tooltip>
          )}
        </div>
      </td>
      <td className={classes.cellEmail}>
        {contact.email ? (
          <Tooltip {...CustomTooltipProps} title={contact.email}>
            <span className={classes.truncateText}>{contact.email}</span>
          </Tooltip>
        ) : (
          <span className={`${classes.truncateText} ${classes.textMuted}`}>-</span>
        )}
      </td>
      <td className={classes.cellCity}>
        {contact.city ? (
          <Tooltip {...CustomTooltipProps} title={contact.city}>
            <span className={classes.truncateText}>{contact.city}</span>
          </Tooltip>
        ) : (
          <span className={`${classes.truncateText} ${classes.textMuted}`}>-</span>
        )}
      </td>
      <td className={classes.cellTags}>
        <div className={classes.tagsWrapper}>
          {tags.length > 0 && (
            <>
              {tags.slice(0, 4).map((tag, tagIdx) => {
                const key = `contact-${contact.id}-tag-${tag.id}-${tagIdx}`;
                const tagColor = tag.color || "#9CA3AF";
                const textColor = getTextColor(tagColor);
                return (
                  <Tooltip {...CustomTooltipProps} title={tag.name} key={key}>
                    <div
                      className={classes.tagChip}
                      style={{
                        backgroundColor: tagColor,
                        color: textColor,
                        border: `2px solid ${tagColor}`,
                      }}
                    >
                      {tag.name}
                    </div>
                  </Tooltip>
                );
              })}
              {tags.length > 4 && (
                <Tooltip {...CustomTooltipProps} title={tags.slice(4).map((t) => t.name).filter(Boolean).join(", ")}>
                  <span className={classes.tagMore}>+{tags.length - 4}</span>
                </Tooltip>
              )}
            </>
          )}
        </div>
      </td>
      <td className={classes.cellStatus}>
        <span className={`${classes.statusChip} ${statusClass}`}>
          {contact.situation || (contact.active ? "Ativo" : "Inativo")}
        </span>
      </td>
      <td align="right" className={classes.cellActions} data-skip-row-click>
        <div className={classes.actionsInner}>
          <Tooltip {...CustomTooltipProps} title="Enviar mensagem pelo WhatsApp">
            <IconButton size="small" onClick={() => onSendMessage(contact)} style={{ color: theme.palette.success?.main || "#16a34a" }}>
              <WhatsApp />
            </IconButton>
          </Tooltip>
          <Tooltip {...CustomTooltipProps} title="Editar contato">
            <IconButton size="small" onClick={() => onEdit(contact.id)} style={{ color: theme.palette.primary?.main || "#2563eb" }}>
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip {...CustomTooltipProps} title={contact.active ? "Bloquear contato" : "Desbloquear contato"}>
            <IconButton size="small" onClick={() => (contact.active ? onBlock(contact) : onUnblock(contact))} style={{ color: theme.palette.grey[700] }}>
              {contact.active ? <LockIcon /> : <Unlock style={{ width: 20, height: 20 }} />}
            </IconButton>
          </Tooltip>
          <Tooltip {...CustomTooltipProps} title="Deletar contato">
            <IconButton size="small" onClick={() => onDelete(contact)} style={{ color: theme.palette.error?.main || "#dc2626" }}>
              <DeleteOutlineIcon />
            </IconButton>
          </Tooltip>
        </div>
      </td>
    </tr>
  );
});

ContactRow.displayName = "ContactRow";

export default ContactRow;
