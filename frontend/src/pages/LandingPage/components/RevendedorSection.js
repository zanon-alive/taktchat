import React, { useState } from "react";
import { makeStyles } from "@mui/styles";
import {
  Box,
  Container,
  Grid,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  CircularProgress,
} from "@mui/material";
import PartnerIcon from "@mui/icons-material/Handshake";
import api from "../../../services/api";
import { toast } from "react-toastify";

const useStyles = makeStyles((theme) => ({
  section: {
    padding: theme.spacing(10, 0),
    background: "linear-gradient(135deg, #065183 0%, #0a7ab8 100%)",
    color: "#ffffff",
    [theme.breakpoints.down("sm")]: {
      padding: theme.spacing(6, 0),
    },
  },
  title: {
    fontWeight: 700,
    fontSize: "2rem",
    marginBottom: theme.spacing(2),
    color: "#ffffff",
    [theme.breakpoints.down("sm")]: {
      fontSize: "1.5rem",
    },
  },
  subtitle: {
    fontSize: "1.1rem",
    lineHeight: 1.6,
    color: "rgba(255, 255, 255, 0.95)",
    marginBottom: theme.spacing(3),
  },
  ctaColumn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    [theme.breakpoints.down("sm")]: {
      justifyContent: "flex-start",
    },
  },
  ctaButton: {
    padding: theme.spacing(2, 4),
    fontSize: "1.1rem",
    fontWeight: 700,
    textTransform: "none",
    backgroundColor: "#ffffff",
    color: theme.palette.primary.main,
    borderRadius: "12px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
    "&:hover": {
      backgroundColor: "rgba(255, 255, 255, 0.95)",
      boxShadow: "0 6px 24px rgba(0,0,0,0.2)",
    },
  },
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

const RevendedorSection = () => {
  const classes = useStyles();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setForm({ name: "", email: "", phone: "", message: "" });
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
      const fullPhone = phoneClean.length <= 11 && !phoneClean.startsWith("55") ? `55${phoneClean}` : phoneClean;
      await api.post("/leads", {
        name: form.name,
        email: form.email,
        phone: fullPhone,
        message: form.message ? `[Revendedor] ${form.message}` : "[Revendedor] Interesse em parceria.",
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
    <>
      <Box id="revendedor" className={classes.section}>
        <Container>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={7}>
              <Typography variant="h2" className={classes.title}>
                Seja um revendedor <strong>TaktChat</strong>
              </Typography>
              <Typography className={classes.subtitle}>
                O TaktChat oferece programas de parceria para revendedores. Escolha o que combina com você e garanta sua comissão.
              </Typography>
            </Grid>
            <Grid item xs={12} md={5} className={classes.ctaColumn}>
              <Button
                variant="contained"
                className={classes.ctaButton}
                startIcon={<PartnerIcon />}
                onClick={handleOpen}
                size="large"
              >
                Seja um parceiro TaktChat
              </Button>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: "16px" } }}>
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
    </>
  );
};

export default RevendedorSection;
