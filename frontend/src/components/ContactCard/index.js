import React, { memo, useRef, useCallback, useState } from "react";
import { Unlock, CheckCircle, Ban } from "lucide-react";
import { WhatsApp, Edit as EditIcon, DeleteOutline as DeleteOutlineIcon, Lock as LockIcon, MoreVert } from "@mui/icons-material";
import { Tooltip, IconButton, Button, Menu, MenuItem } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { useTheme } from "@mui/material";
import LazyContactAvatar from "../LazyContactAvatar";

const TOUCH_TARGET_SIZE = 44;

const useStyles = makeStyles((theme) => ({
  card: {
    width: "100%",
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    boxShadow: theme.shadows[1],
    borderRadius: 12,
    padding: theme.spacing(2),
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(1.25),
    transition: "transform 0.15s ease",
    "&$cardSelected": {
      outline: `2px solid ${theme.palette.primary.main}`,
      outlineOffset: 2,
    },
    "&$cardPressing": {
      transform: "scale(0.99)",
    },
  },
  cardSelected: {},
  cardPressing: {},
  contentRow: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(2),
    minWidth: 0,
  },
  contentArea: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(1),
    flex: 1,
    minWidth: 0,
    cursor: "pointer",
    outline: "none",
    "&:focus": {
      borderRadius: theme.shape.borderRadius,
      outline: `2px solid ${theme.palette.primary.main}`,
      outlineOffset: 2,
    },
  },
  statusChipWrapper: {
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  row1: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1.5),
    minWidth: 0,
  },
  avatarWrapper: {
    width: 44,
    height: 44,
    minWidth: 44,
    minHeight: 44,
    borderRadius: "50%",
    overflow: "hidden",
    backgroundColor: theme.palette.grey[300],
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  nameCol: {
    display: "flex",
    flexDirection: "column",
    flex: 1,
    minWidth: 0,
  },
  name: {
    fontSize: "0.875rem",
    fontWeight: 600,
    color: theme.palette.text.primary,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  email: {
    fontSize: "0.75rem",
    color: theme.palette.text.secondary,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  row2: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
    minWidth: 0,
  },
  phone: {
    fontSize: "0.875rem",
    color: theme.palette.text.secondary,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  iconWrapper: {
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  iconInvalid: {
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "50%",
    padding: 2,
    backgroundColor: theme.palette.error.light,
  },
  row3: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing(1),
    flexWrap: "wrap",
  },
  statusChip: {
    display: "inline-flex",
    padding: theme.spacing(0.25, 1),
    fontSize: "0.75rem",
    fontWeight: 500,
    borderRadius: 9999,
    flexShrink: 0,
  },
  statusAtivo: {
    backgroundColor: theme.palette.success.light,
    color: theme.palette.success.dark,
  },
  statusInativo: {
    backgroundColor: theme.palette.error.light,
    color: theme.palette.error.dark,
  },
  statusSuspenso: {
    backgroundColor: theme.palette.grey[300],
    color: theme.palette.grey[800],
  },
  statusDefault: {
    backgroundColor: theme.palette.grey[400],
    color: theme.palette.grey[900],
  },
  tagsWrapper: {
    display: "flex",
    gap: theme.spacing(0.5),
    flexWrap: "wrap",
    justifyContent: "flex-end",
    minWidth: 0,
  },
  tagChip: {
    display: "inline-flex",
    alignItems: "center",
    padding: theme.spacing(0.25, 1),
    borderRadius: 9999,
    fontSize: "0.75rem",
    fontWeight: 500,
    maxWidth: 100,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  tagMore: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: 20,
    height: 20,
    fontSize: "10px",
    fontWeight: 600,
    color: theme.palette.common.white,
    backgroundColor: theme.palette.grey[600],
    borderRadius: "50%",
    flexShrink: 0,
  },
  row4: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: theme.spacing(1),
    paddingTop: theme.spacing(1),
    borderTop: `1px solid ${theme.palette.divider}`,
  },
}));

// Componente de card de contato para versão mobile, memoizado para evitar re-renders
const ContactCard = memo(({ 
  contact,
  onEdit,
  onSendMessage,
  onDelete,
  onBlock,
  onUnblock,
  formatPhoneNumber,
  CustomTooltipProps,
  // Seleção mobile
  isSelectionMode = false,
  onLongPressStart,
  onDragSelect,
  onLongPressEnd,
  onTapWhileSelection,
  isSelected = false,
}) => {
  const theme = useTheme();
  const classes = useStyles();
  const longPressTimerRef = useRef(null);
  const longPressTriggeredRef = useRef(false);
  const skipNextContentClickRef = useRef(false);
  const [pressing, setPressing] = useState(false);
  const [moreAnchorEl, setMoreAnchorEl] = useState(null);
  const moreOpen = Boolean(moreAnchorEl);
  const handleMoreOpen = (e) => {
    e.stopPropagation();
    setMoreAnchorEl(e.currentTarget);
  };
  const handleMoreClose = () => setMoreAnchorEl(null);

  const clearTimer = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, []);

  const handleTouchStart = useCallback((e) => {
    longPressTriggeredRef.current = false;
    setPressing(true);
    clearTimer();
    longPressTimerRef.current = setTimeout(() => {
      longPressTriggeredRef.current = true;
      if (onLongPressStart) onLongPressStart(contact.id);
    }, 500);
  }, [clearTimer, onLongPressStart, contact?.id]);

  const handleTouchMove = useCallback((e) => {
    if (!isSelectionMode && !longPressTriggeredRef.current) return;
    const touch = e.touches && e.touches[0];
    if (!touch) return;
    const el = document.elementFromPoint(touch.clientX, touch.clientY);
    if (!el) return;
    const wrapper = el.closest && el.closest('[data-contact-id]');
    const id = wrapper && wrapper.getAttribute && wrapper.getAttribute('data-contact-id');
    if (id && onDragSelect) onDragSelect(Number(id));
  }, [isSelectionMode, onDragSelect]);

  const handleTouchEnd = useCallback(() => {
    if (longPressTriggeredRef.current) {
      skipNextContentClickRef.current = true;
      setTimeout(() => { skipNextContentClickRef.current = false; }, 300);
    }
    clearTimer();
    setPressing(false);
    if (longPressTriggeredRef.current) {
      if (onLongPressEnd) onLongPressEnd();
    } else if (isSelectionMode && onTapWhileSelection) {
      onTapWhileSelection(contact.id);
    }
  }, [clearTimer, onLongPressEnd, isSelectionMode, onTapWhileSelection, contact.id]);

  const handleContentTap = useCallback(() => {
    if (skipNextContentClickRef.current) return;
    onEdit(contact.id);
  }, [contact.id, onEdit]);

  const handleContentKeyDown = useCallback((e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleContentTap();
    }
  }, [handleContentTap]);

  const cardClassName = [
    classes.card,
    isSelected && classes.cardSelected,
    pressing && classes.cardPressing,
  ].filter(Boolean).join(" ");

  const statusClass = contact.situation === "Ativo"
    ? classes.statusAtivo
    : contact.situation === "Inativo"
      ? classes.statusInativo
      : contact.situation === "Suspenso"
        ? classes.statusSuspenso
        : classes.statusDefault;

  // Normaliza tags (extraído para usar em mais de um lugar se necessário)
  const normalizeTags = (raw) => {
    try {
      let arr = [];
      if (Array.isArray(raw)) arr = raw;
      else if (Array.isArray(raw?.tags)) arr = raw.tags;
      else if (Array.isArray(raw?.tags?.rows)) arr = raw.tags.rows;
      else if (Array.isArray(raw?.rows)) arr = raw.rows;
      if (!arr || arr.length === 0) return [];
      return arr.map((t, idx) => {
        if (!t || typeof t !== 'object') return null;
        const obj = t;
        const nested = obj.tag || obj.Tag || obj.Tags || {};
        const name = obj.name || nested.name || obj.label;
        if (!name) return null;
        const color = obj.color || nested.color || obj.hex || '#9CA3AF';
        let id = obj.tagId ?? obj.id ?? nested.id ?? `tag-${contact.id}-${idx}`;
        return { id, name, color };
      }).filter(Boolean);
    } catch {
      return [];
    }
  };
  const getTextColor = (hexColor) => {
    if (!hexColor) return '#000000';
    let hex = hexColor.replace('#', '');
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? '#000000' : '#FFFFFF';
  };
  const rawTags = contact.tags || contact.contactTags || [];
  const tags = normalizeTags(rawTags);

  return (
    <div
      role="article"
      aria-label={`Contato ${contact.name || "Sem nome"}`}
      className={cardClassName}
      data-contact-id={contact.id}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
      {/* Linha superior: conteúdo clicável (editar) + status à direita, centralizado */}
      <div className={classes.contentRow}>
        <div
          role="button"
          tabIndex={0}
          onClick={handleContentTap}
          onKeyDown={handleContentKeyDown}
          className={classes.contentArea}
          aria-label={`Editar contato ${contact.name || "Sem nome"}`}
        >
          {/* Linha 1: Avatar + Nome (e email só se existir) */}
          <div className={classes.row1}>
            <div className={classes.avatarWrapper}>
              <LazyContactAvatar
                contact={contact}
                style={{ width: 44, height: 44, borderRadius: "50%", objectFit: "cover" }}
              />
            </div>
            <div className={classes.nameCol}>
              <span className={classes.name} title={contact.name}>
                {contact.name || "Sem nome"}
              </span>
              {contact.email ? (
                <span className={classes.email} title={contact.email}>
                  {contact.email}
                </span>
              ) : null}
            </div>
          </div>

          {/* Linha 2: Telefone + indicador WhatsApp */}
          <div className={classes.row2}>
            <span className={classes.phone} title={formatPhoneNumber(contact.number)}>
              {formatPhoneNumber(contact.number)}
            </span>
            {contact.isWhatsappValid ? (
              <Tooltip {...CustomTooltipProps} title="WhatsApp válido">
                <span className={classes.iconWrapper}>
                  <CheckCircle style={{ width: 16, height: 16, color: theme.palette.success.main }} strokeWidth={2.5} />
                </span>
              </Tooltip>
            ) : (
              <Tooltip {...CustomTooltipProps} title="WhatsApp inválido">
                <span className={classes.iconInvalid}>
                  <Ban style={{ width: 14, height: 14, color: theme.palette.error.main }} strokeWidth={2.5} />
                </span>
              </Tooltip>
            )}
          </div>
        </div>
        <div className={classes.statusChipWrapper}>
          <span className={`${classes.statusChip} ${statusClass}`}>
            {contact.situation || (contact.active ? "Ativo" : "Inativo")}
          </span>
        </div>
      </div>

      {/* Linha 3: Tags (só aparece se houver) */}
      {(tags.length > 0) && (
        <div className={classes.row3}>
          <div className={classes.tagsWrapper}>
            {tags.slice(0, 3).map((tag, tagIdx) => {
              const key = `contact-${contact.id}-tag-${tag.id}-${tagIdx}`;
              const tagColor = tag.color || "#9CA3AF";
              const textColor = getTextColor(tagColor);
              return (
                <Tooltip {...CustomTooltipProps} title={tag.name} key={key}>
                  <span
                    className={classes.tagChip}
                    style={{
                      backgroundColor: tagColor,
                      color: textColor,
                      border: `1px solid ${tagColor}`,
                    }}
                  >
                    {tag.name}
                  </span>
                </Tooltip>
              );
            })}
            {tags.length > 3 && (
              <Tooltip {...CustomTooltipProps} title={tags.slice(3).map((t) => t.name).join(", ")}>
                <span className={classes.tagMore}>+{tags.length - 3}</span>
              </Tooltip>
            )}
          </div>
        </div>
      )}

      {/* Linha 4: Ações (WhatsApp em destaque; demais secundários; área de toque min 44px) */}
      <div className={classes.row4}>
        <Tooltip {...CustomTooltipProps} title="Enviar mensagem pelo WhatsApp">
          <Button
            variant="contained"
            size="small"
            onClick={() => onSendMessage(contact)}
            aria-label="Enviar mensagem pelo WhatsApp"
            style={{
              backgroundColor: theme.palette.success?.main || "#16a34a",
              color: theme.palette.success?.contrastText || "#fff",
              minWidth: TOUCH_TARGET_SIZE,
              minHeight: TOUCH_TARGET_SIZE,
              padding: 0,
            }}
          >
            <WhatsApp fontSize="small" />
          </Button>
        </Tooltip>
        <Tooltip {...CustomTooltipProps} title="Mais ações">
          <IconButton
            size="small"
            onClick={handleMoreOpen}
            aria-label="Mais ações"
            aria-controls={moreOpen ? "contact-card-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={moreOpen ? "true" : undefined}
            style={{
              color: theme.palette.grey?.[700] || "#6b7280",
              minWidth: TOUCH_TARGET_SIZE,
              minHeight: TOUCH_TARGET_SIZE,
            }}
          >
            <MoreVert />
          </IconButton>
        </Tooltip>
        <Menu
          id="contact-card-menu"
          anchorEl={moreAnchorEl}
          open={moreOpen}
          onClose={handleMoreClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <MenuItem
            onClick={() => { handleMoreClose(); onEdit(contact.id); }}
            aria-label="Editar contato"
          >
            <EditIcon fontSize="small" style={{ marginRight: 8, color: theme.palette.primary?.main }} />
            Editar contato
          </MenuItem>
          <MenuItem
            onClick={() => { handleMoreClose(); contact.active ? onBlock(contact) : onUnblock(contact); }}
            aria-label={contact.active ? "Bloquear contato" : "Desbloquear contato"}
          >
            {contact.active ? (
              <LockIcon fontSize="small" style={{ marginRight: 8, color: theme.palette.grey?.[700] }} />
            ) : (
              <Unlock style={{ width: 18, height: 18, marginRight: 8 }} />
            )}
            {contact.active ? "Bloquear contato" : "Desbloquear contato"}
          </MenuItem>
          <MenuItem
            onClick={() => { handleMoreClose(); onDelete(contact); }}
            aria-label="Deletar contato"
            style={{ color: theme.palette.error?.main }}
          >
            <DeleteOutlineIcon fontSize="small" style={{ marginRight: 8 }} />
            Deletar contato
          </MenuItem>
        </Menu>
      </div>
    </div>
  );
});

// Nome de exibição para debugging
ContactCard.displayName = 'ContactCard';

export default ContactCard;
