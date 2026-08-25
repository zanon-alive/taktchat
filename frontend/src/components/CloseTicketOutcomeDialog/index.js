import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  IconButton
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import toastError from "../../errors/toastError";
import useSettings from "../../hooks/useSettings";

function CloseTicketOutcomeDialog({ open, onClose, onConfirm }) {
  const [tags, setTags] = useState([]);
  const [closedTagId, setClosedTagId] = useState("");
  const [loaded, setLoaded] = useState(false);
  const { getAll: getAllSettings } = useSettings();

  useEffect(() => {
    if (!open) {
      setLoaded(false);
      return;
    }
    const load = async () => {
      try {
        const { data } = await api.get("/tag/kanban/");
        setTags(data?.lista || []);
        const list = await getAllSettings();
        if (Array.isArray(list)) {
          const closed = list.find((item) => item.key === "closedKanbanTagId");
          setClosedTagId(!closed?.value || closed.value === "0" ? "" : String(closed.value));
        }
      } catch (err) {
        toastError(err);
      } finally {
        setLoaded(true);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (open && loaded && tags.length === 0) {
      onConfirm({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, loaded, tags.length]);

  const closedOutcomes = tags.filter(
    (tag) => String(tag.id) === closedTagId || /fechado/i.test(tag.name || "")
  );
  const outcomes = closedOutcomes.length > 0 ? closedOutcomes : tags;

  if (open && tags.length === 0) {
    return null;
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>
        {i18n.t("tickets.outcome.title")}
        <IconButton
          onClick={onClose}
          size="small"
          aria-label="fechar"
          style={{ position: "absolute", right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="textSecondary">
          {i18n.t("tickets.outcome.hint")}
        </Typography>
      </DialogContent>
      <DialogActions style={{ flexDirection: "column", alignItems: "stretch", padding: 16, gap: 8 }}>
        {outcomes.map((tag) => (
          <Button
            key={tag.id}
            variant={String(tag.id) === closedTagId ? "contained" : "outlined"}
            color="primary"
            onClick={() => onConfirm({ kanbanCloseTagId: tag.id })}
          >
            {tag.name}
          </Button>
        ))}
        <Button onClick={() => onConfirm({ leaveKanbanBoard: true })}>
          {i18n.t("tickets.outcome.leaveBoard")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default CloseTicketOutcomeDialog;
