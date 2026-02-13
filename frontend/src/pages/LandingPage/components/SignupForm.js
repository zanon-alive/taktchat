import React, { useState, useEffect } from "react";
import { makeStyles } from "@mui/styles";
import {
  Typography,
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from "@mui/material";
import { toast } from "react-toastify";
import { openApi } from "../../../services/api";
import toastError from "../../../errors/toastError";

const useStyles = makeStyles((theme) => ({
  formContainer: {
    maxWidth: "800px",
    margin: "0 auto",
  },
  sectionTitle: {
    fontWeight: 700,
    marginBottom: theme.spacing(1),
    textAlign: "center",
    color: "#ffffff",
  },
  sectionSubtitle: {
    textAlign: "center",
    marginBottom: theme.spacing(4),
    color: "rgba(255, 255, 255, 0.9)",
  },
  formCard: {
    padding: theme.spacing(4),
    backgroundColor: "rgba(255, 255, 255, 0.98)",
    borderRadius: "16px",
    boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
    [theme.breakpoints.down("xs")]: {
      padding: theme.spacing(2),
    },
  },
  submitButton: {
    padding: theme.spacing(1.5, 4),
    fontSize: "1.1rem",
    fontWeight: 700,
    textTransform: "none",
    marginTop: theme.spacing(2),
    borderRadius: "8px",
  },
  inputField: {
    "& .MuiOutlinedInput-root": {
      borderRadius: "8px",
      backgroundColor: "#f9f9f9",
      "&:hover": {
        backgroundColor: "#fff",
      },
      "&.Mui-focused": {
        backgroundColor: "#fff",
      },
    },
  },
}));

const SignupForm = () => {
  const classes = useStyles();
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [enabled, setEnabled] = useState(false);
  const [plans, setPlans] = useState([]);
  const [trialDays, setTrialDays] = useState(14);
  const [form, setForm] = useState({
    companyName: "",
    adminName: "",
    email: "",
    password: "",
    phone: "",
    planId: "",
  });

  useEffect(() => {
    checkConfig();
  }, []);

  const checkConfig = async () => {
    try {
      const { data } = await openApi.get("/public/direct-signup/config");
      if (data.enabled && data.plans && data.plans.length > 0) {
        setEnabled(true);
        setPlans(data.plans);
        setTrialDays(data.trialDays || 14);
      } else {
        setEnabled(false);
      }
    } catch (e) {
      setEnabled(false);
    } finally {
      setValidating(false);
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
      await openApi.post("/public/direct-signup", {
        companyName: form.companyName,
        adminName: form.adminName,
        email: form.email,
        password: form.password,
        phone: form.phone || "",
        planId: parseInt(form.planId),
      });

      toast.success(`Cadastro realizado com sucesso! Você tem ${trialDays} dias de trial. Você pode fazer login agora.`, { autoClose: 5000 });
      
      // Reset form
      setForm({
        companyName: "",
        adminName: "",
        email: "",
        password: "",
        phone: "",
        planId: "",
      });
      
      // Scroll to top
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      toastError(e);
    }
    setLoading(false);
  };

  if (validating) {
    return null;
  }

  if (!enabled) {
    return null;
  }

  return (
    <Box className={classes.formContainer}>
      <Typography variant="h3" className={classes.sectionTitle}>
        Cadastre sua empresa agora
      </Typography>
      <Typography variant="h6" className={classes.sectionSubtitle}>
        Preencha o formulário abaixo e comece a usar o TaktChat hoje mesmo
      </Typography>
      
      <Card className={classes.formCard}>
        <CardContent>
          {trialDays > 0 && (
            <Alert severity="info" sx={{ mb: 3 }}>
              <strong>Teste grátis por {trialDays} dias!</strong> Sem necessidade de cartão de crédito.
            </Alert>
          )}
          
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  className={classes.inputField}
                  fullWidth
                  label="Nome da empresa"
                  value={form.companyName}
                  onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                  required
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  className={classes.inputField}
                  fullWidth
                  label="Nome do responsável"
                  value={form.adminName}
                  onChange={(e) => setForm({ ...form, adminName: e.target.value })}
                  required
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  className={classes.inputField}
                  fullWidth
                  label="E-mail"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  className={classes.inputField}
                  fullWidth
                  label="Telefone"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  className={classes.inputField}
                  fullWidth
                  label="Senha"
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  inputProps={{ minLength: 5 }}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth variant="outlined" className={classes.inputField}>
                  <InputLabel>Plano</InputLabel>
                  <Select
                    value={form.planId}
                    onChange={(e) => setForm({ ...form, planId: e.target.value })}
                    label="Plano"
                    required
                  >
                    <MenuItem value="">Selecione um plano</MenuItem>
                    {plans.map((plan) => (
                      <MenuItem key={plan.id} value={plan.id}>
                        {plan.name} - {plan.recurrence === "ANUAL" ? "Anual" : "Mensal"}
                        {plan.amount && ` - R$ ${parseFloat(plan.amount).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
                        {plan.recurrence === "ANUAL" && plan.amountAnnual && ` / R$ ${parseFloat(plan.amountAnnual).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}/ano`}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  className={classes.submitButton}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : "Cadastrar e começar agora"}
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default SignupForm;
