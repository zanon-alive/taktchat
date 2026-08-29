import React, { useState } from "react";
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

const CATEGORIES = [
  "duplicado",
  "teste",
  "erro_abertura",
  "contato_pediu",
  "lgpd",
  "outro",
];

const MIN = 15;
const MAX = 500;

const HideTicketModal = ({ open, onClose, ticket, onSuccess }) => {
  const [category, setCategory] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const trimmed = reason.trim();
  const valid = CATEGORIES.includes(category) && trimmed.length >= MIN && trimmed.length <= MAX;

  const resetAndClose = () => {
    setCategory("");
    setReason("");
    onClose();
  };

  const handleClose = () => {
    if (loading) return;
    resetAndClose();
  };

  const handleSubmit = async () => {
    if (!valid || !ticket?.id) return;
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
            {i18n.t("hideTicketModal.title")} #{ticket?.id}
          </span>
          <IconButton onClick={handleClose} size="small" aria-label="fechar" disabled={loading}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Typography variant="body2" paragraph>
          {i18n.t("hideTicketModal.message")}
        </Typography>
        <FormControl fullWidth margin="dense">
          <InputLabel id="hide-ticket-category">{i18n.t("hideTicketModal.category")}</InputLabel>
          <Select
            labelId="hide-ticket-category"
            label={i18n.t("hideTicketModal.category")}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {CATEGORIES.map((slug) => (
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
          onChange={(e) => setReason(e.target.value.slice(0, MAX))}
          helperText={`${trimmed.length}/${MAX} (${i18n.t("hideTicketModal.reasonHint")})`}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="inherit" disabled={loading}>
          {i18n.t("hideTicketModal.cancel")}
        </Button>
        <Button
          onClick={handleSubmit}
          color="secondary"
          variant="contained"
          disabled={!valid || loading}
        >
          {i18n.t("hideTicketModal.confirm")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default HideTicketModal;
