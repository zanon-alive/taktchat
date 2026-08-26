import React, { useState } from "react";
import { makeStyles } from "@mui/styles";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  CircularProgress,
  Typography,
} from "@mui/material";
import api from "../../services/api";
import { toast } from "react-toastify";

const useStyles = makeStyles((theme) => ({
  dialogTitle: {
    fontWeight: 700,
    fontSize: "1.25rem",
  },
  dialogSubtitle: {
    marginTop: theme.spacing(1),
    color: theme.palette.text.secondary,
    fontSize: "0.95rem",
  },
  formField: {
    marginBottom: theme.spacing(2),
    "& .MuiOutlinedInput-root": {
      borderRadius: "8px",
    },
  },
  submitButton: {
    marginTop: theme.spacing(2),
    padding: theme.spacing(1.5, 3),
    fontWeight: 600,
    textTransform: "none",
  },
}));

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  message: "",
};

const RevendedorDialog = ({ open, onClose }) => {
  const classes = useStyles();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const handleClose = () => {
    setForm(emptyForm);
    if (onClose) onClose();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) {
      toast.error("Preencha nome, e-mail e telefone.");
      return;
    }
    setLoading(true);
    try {
      const phoneClean = form.phone.replace(/\D/g, "");
      const fullPhone =
        phoneClean.length <= 11 && !phoneClean.startsWith("55")
          ? `55${phoneClean}`
          : phoneClean;
      await api.post("/leads", {
        name: form.name,
        email: form.email,
        phone: fullPhone,
        message: form.message
          ? `[Revendedor] ${form.message}`
          : "[Revendedor] Interesse em parceria.",
        source: "revendedor",
      });
      toast.success("Enviado com sucesso! Em breve entraremos em contato.");
      handleClose();
    } catch (err) {
      const msg = err.response?.data?.error || "Erro ao enviar. Tente novamente.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: "16px" } }}
    >
      <DialogTitle>
        <Typography className={classes.dialogTitle}>
          Falta pouco para você se tornar nosso parceiro TaktChat
        </Typography>
        <Typography className={classes.dialogSubtitle}>
          Todos os seus dados estão seguros. Em breve entraremos em contato.
        </Typography>
      </DialogTitle>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Nome"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            className={classes.formField}
            variant="outlined"
            margin="dense"
          />
          <TextField
            fullWidth
            label="E-mail"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
            className={classes.formField}
            variant="outlined"
            margin="dense"
          />
          <TextField
            fullWidth
            label="Telefone / WhatsApp"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            required
            placeholder="(00) 00000-0000"
            className={classes.formField}
            variant="outlined"
            margin="dense"
          />
          <TextField
            fullWidth
            label="Mensagem (opcional)"
            name="message"
            value={form.message}
            onChange={handleChange}
            multiline
            rows={3}
            className={classes.formField}
            variant="outlined"
            margin="dense"
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            className={classes.submitButton}
            disabled={loading}
            fullWidth
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Enviar"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RevendedorDialog;
