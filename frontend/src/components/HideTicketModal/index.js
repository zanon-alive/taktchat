import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import toastError from "../../errors/toastError";

const HideTicketModal = ({ open, onClose, ticket, onSuccess }) => {
  const [categories, setCategories] = useState([]);
  const [reasonMin, setReasonMin] = useState(15);
  const [reasonMax, setReasonMax] = useState(500);
  const [category, setCategory] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [lgpdStep, setLgpdStep] = useState(false);

  const trimmed = reason.trim();
  const valid =
    categories.includes(category) &&
    trimmed.length >= reasonMin &&
    trimmed.length <= reasonMax;

  useEffect(() => {
    if (!open) return;
    let ignore = false;
    const load = async () => {
      try {
        const { data } = await api.get("/tickets/deletion-meta");
        if (ignore) return;
        setCategories(data.categories || []);
        setReasonMin(data.reasonMin || 15);
        setReasonMax(data.reasonMax || 500);
      } catch (err) {
        if (!ignore) {
          setCategories([
            "duplicado",
            "teste",
            "erro_abertura",
            "contato_pediu",
            "lgpd",
            "outro",
          ]);
        }
      }
    };
    load();
    return () => {
      ignore = true;
    };
  }, [open]);

  const resetAndClose = () => {
    setCategory("");
    setReason("");
    setLgpdStep(false);
    onClose();
  };

  const handleClose = () => {
    if (loading) return;
    resetAndClose();
  };

  const handleSubmit = async () => {
    if (!valid || !ticket?.id) return;
    if (category === "lgpd" && !lgpdStep) {
      setLgpdStep(true);
      return;
    }
    setLoading(true);
    try {
      await api.delete(`/tickets/${ticket.id}`, {
        data: { category, reason: trimmed },
      });
      resetAndClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      toastError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <span>
            {lgpdStep
              ? i18n.t("hideTicketModal.lgpdTitle")
              : `${i18n.t("hideTicketModal.title")} #${ticket?.id}`}
          </span>
          <IconButton onClick={handleClose} size="small" aria-label="fechar" disabled={loading}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        {lgpdStep ? (
          <Typography variant="body2" color="error">
            {i18n.t("hideTicketModal.lgpdWarning")}
          </Typography>
        ) : (
          <>
            <Typography variant="body2" paragraph>
              {i18n.t("hideTicketModal.message")}
            </Typography>
            <FormControl fullWidth margin="dense">
              <InputLabel id="hide-ticket-category">{i18n.t("hideTicketModal.category")}</InputLabel>
              <Select
                labelId="hide-ticket-category"
                label={i18n.t("hideTicketModal.category")}
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setLgpdStep(false);
                }}
              >
                {categories.map((slug) => (
                  <MenuItem key={slug} value={slug}>
                    {i18n.t(`hideTicketModal.categories.${slug}`)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              margin="dense"
              multiline
              minRows={3}
              label={i18n.t("hideTicketModal.reason")}
              value={reason}
              onChange={(e) => setReason(e.target.value.slice(0, reasonMax))}
              helperText={`${trimmed.length}/${reasonMax} (${i18n.t("hideTicketModal.reasonHint")})`}
            />
          </>
        )}
      </DialogContent>
      <DialogActions>
        {lgpdStep ? (
          <Button onClick={() => setLgpdStep(false)} color="inherit" disabled={loading}>
            {i18n.t("hideTicketModal.back")}
          </Button>
        ) : (
          <Button onClick={handleClose} color="inherit" disabled={loading}>
            {i18n.t("hideTicketModal.cancel")}
          </Button>
        )}
        <Button
          onClick={handleSubmit}
          color="secondary"
          variant="contained"
          disabled={!valid || loading}
        >
          {lgpdStep
            ? i18n.t("hideTicketModal.lgpdConfirm")
            : i18n.t("hideTicketModal.confirm")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default HideTicketModal;
