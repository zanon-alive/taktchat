import React, { useState, useEffect } from "react";
import { useHistory, useLocation } from "react-router-dom";
import {
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import { toast } from "react-toastify";
import { openApi } from "../../services/api";
import toastError from "../../errors/toastError";
import usePlans from "../../hooks/usePlans";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    backgroundColor: theme.palette.background.default,
    padding: theme.spacing(2),
  },
  paper: {
    padding: theme.spacing(4),
    maxWidth: 500,
    width: "100%",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(2),
  },
  title: {
    marginBottom: theme.spacing(3),
    textAlign: "center",
  },
}));

export default function SignupPartner() {
  const classes = useStyles();
  const history = useHistory();
  const location = useLocation();
  const { getPlanList } = usePlans();
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [partner, setPartner] = useState(null);
  const [plans, setPlans] = useState([]);
  const [form, setForm] = useState({
    companyName: "",
    adminName: "",
    email: "",
    password: "",
    phone: "",
    planId: "",
  });

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    const partnerId = params.get("partner");

    if (!token && !partnerId) {
      toast.error("Parceiro não especificado.");
      history.push("/login");
      return;
    }

    validatePartner({ token, partnerId });
  }, [location.search, history]);

  const validatePartner = async ({ token, partnerId }) => {
    try {
      const configParams = token ? { token } : { partnerId };
      const { data } = await openApi.get("/public/partner-signup/config", {
        params: configParams
      });
      
      if (!data || !data.partner || !data.plans || data.plans.length === 0) {
        toast.error("Parceiro não possui planos disponíveis.");
        history.push("/login");
        return;
      }

      setPlans(data.plans);
      setPartner(data.partner);
      setValidating(false);
    } catch (e) {
      const errorMsg = e?.response?.data?.error || "Parceiro inválido ou não disponível.";
      toast.error(errorMsg);
      history.push("/login");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.companyName || !form.adminName || !form.email || !form.password || !form.planId) {
      toast.error("Preencha todos os campos obrigatórios.");
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams(location.search);
      const token = params.get("token");
      const partnerId = params.get("partner");

      const body = {
        companyName: form.companyName,
        adminName: form.adminName,
        email: form.email,
        password: form.password,
        phone: form.phone || "",
        planId: parseInt(form.planId),
      };
      if (token) {
        body.token = token;
      } else {
        body.partnerId = parseInt(partnerId);
      }

      const response = await openApi.post("/public/partner-signup", body);
      
      const trialDays = partner?.trialDays || 7;
      toast.success(
        `Cadastro realizado com sucesso! Você tem ${trialDays} dias de trial. Você pode fazer login agora.`,
        { autoClose: 5000 }
      );
      history.push("/login");
    } catch (e) {
      toastError(e);
    }
    setLoading(false);
  };

  if (validating) {
    return (
      <Box className={classes.root}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box className={classes.root}>
      <Paper className={classes.paper} elevation={3}>
        <Typography variant="h5" className={classes.title}>
          Cadastre sua empresa
        </Typography>
        {partner && (
          <>
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2" component="div">
                <strong>Cadastro através do parceiro: {partner.name}</strong>
                {partner.trialDays && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Você terá <strong>{partner.trialDays} dias</strong> de trial gratuito para testar a plataforma.
                  </Typography>
                )}
              </Typography>
            </Alert>
          </>
        )}
        <form onSubmit={handleSubmit} className={classes.form}>
          <TextField
            label="Nome da empresa"
            value={form.companyName}
            onChange={(e) => setForm({ ...form, companyName: e.target.value })}
            required
            fullWidth
          />
          <TextField
            label="Nome do responsável"
            value={form.adminName}
            onChange={(e) => setForm({ ...form, adminName: e.target.value })}
            required
            fullWidth
          />
          <TextField
            label="E-mail"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
            fullWidth
          />
          <TextField
            label="Telefone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            fullWidth
          />
          <TextField
            label="Senha"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
            fullWidth
            inputProps={{ minLength: 5 }}
          />
          <FormControl fullWidth required>
            <InputLabel>Plano</InputLabel>
            <Select
              value={form.planId}
              onChange={(e) => setForm({ ...form, planId: e.target.value })}
              label="Plano"
            >
              {plans.map((plan) => (
                <MenuItem key={plan.id} value={plan.id}>
                  {plan.name} - {plan.recurrence === "ANUAL" ? "Anual" : "Mensal"}
                  {plan.amount && ` - R$ ${parseFloat(plan.amount).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
                  {plan.recurrence === "ANUAL" && plan.amountAnnual && ` / R$ ${parseFloat(plan.amountAnnual).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}/ano`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : "Cadastrar"}
          </Button>
          <Button
            variant="text"
            fullWidth
            onClick={() => history.push("/login")}
          >
            Já tem uma conta? Faça login
          </Button>
        </form>
      </Paper>
    </Box>
  );
}
