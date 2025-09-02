import React, { useEffect, useState, useContext } from "react";
import { Field } from "formik";
import { useHistory } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import { toast } from "react-toastify";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import api from "../../services/api";
import usePlans from "../../hooks/usePlans";
import toastError from "../../errors/toastError";
import { i18n } from "../../translate/i18n";
import {
  Box,
  Button,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Typography,
  TextField,
  Tooltip
} from "@material-ui/core";
import InfoOutlinedIcon from "@material-ui/icons/InfoOutlined";
import ConfirmationModal from "../../components/ConfirmationModal";
import ForbiddenPage from "../../components/ForbiddenPage";

import { AuthContext } from "../../context/Auth/AuthContext";

const useStyles = makeStyles((theme) => ({
  mainPaper: {
    flex: 1,
    padding: theme.spacing(1),
    // padding: theme.padding,
    overflowY: "scroll",
    ...theme.scrollbarStyles,
  },
  textRight: {
    textAlign: "right",
  },
  tabPanelsContainer: {
    // padding: theme.spacing(2),
    padding: theme.padding,
  },
  paper: {
    padding: theme.spacing(2),
    display: "flex",
    alignItems: "center",
    marginBottom: 12,
  },

}));

const initialSettings = {
  messageInterval: 20,
  longerIntervalAfter: 20,
  greaterInterval: 60,
  variables: [],
  sabado: "false",
  domingo: "false",
  startHour: "09:00",
  endHour: "18:00",
  capHourly: 300,
  capDaily: 2000,
  backoffErrorThreshold: 5,
  backoffPauseMinutes: 10,
  suppressionTagNames: []
};

const CampaignsConfig = () => {
  const classes = useStyles();
  const history = useHistory();

  const [settings, setSettings] = useState(initialSettings);
  const [showVariablesForm, setShowVariablesForm] = useState(false);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [selectedKey, setSelectedKey] = useState(null);
  const [variable, setVariable] = useState({ key: "", value: "" });
  const { user, socket } = useContext(AuthContext);

  const [sabado, setSabado] = React.useState(false);
  const [domingo, setDomingo] = React.useState(false);

  const [startHour, setStartHour] = useState("08:00");
  const [endHour, setEndHour] = useState("19:00");
  // Campo editável (string) para as tags de supressão, separado por vírgula
  const [suppressionTagNamesStr, setSuppressionTagNamesStr] = useState("");

  const { getPlanCompany } = usePlans();

  // --- Integração OpenAI ---
  const [openAI, setOpenAI] = useState({ id: null, name: "OpenAI Principal", apiKey: "", model: "gpt-4o-mini" });
  const [savingOpenAI, setSavingOpenAI] = useState(false);
  const [encryptionEnabled, setEncryptionEnabled] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const companyId = user.companyId;
      const planConfigs = await getPlanCompany(undefined, companyId);
      if (!planConfigs.plan.useCampaigns) {
        toast.error("Esta empresa não possui permissão para acessar essa página! Estamos lhe redirecionando.");
        setTimeout(() => {
          history.push(`/`)
        }, 1000);
      }
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    api.get("/campaign-settings").then(({ data }) => {
      const settingsList = [];
      console.log(data)
      if (Array.isArray(data) && data.length > 0) {
        data.forEach((item) => {
          settingsList.push([item.key, item.value]);
          if (item.key === "sabado") setSabado(item?.value === "true");
          if (item.key === "domingo") setDomingo(item?.value === "true");
          if (item.key === "startHour") setStartHour(item?.value);
          if (item.key === "endHour") setEndHour(item?.value);
          if (item.key === "suppressionTagNames") {
            try {
              const arr = JSON.parse(item.value);
              if (Array.isArray(arr)) setSuppressionTagNamesStr(arr.join(", "));
            } catch (e) {}
          }
        });
        setSettings(Object.fromEntries(settingsList));
      }
    });
  }, []);

  // Status de criptografia (backend)
  useEffect(() => {
    const loadEncryptionStatus = async () => {
      try {
        const { data } = await api.get('/ai/encryption-status');
        setEncryptionEnabled(Boolean(data?.encryptionEnabled));
      } catch (_) {
        setEncryptionEnabled(true); // assume habilitado se não conseguir verificar
      }
    };
    loadEncryptionStatus();
  }, []);

  // Carrega integração OpenAI existente
  useEffect(() => {
    const loadOpenAI = async () => {
      try {
        const { data } = await api.get('/queueIntegration', { params: { searchParam: '', pageNumber: 1 } });
        const items = Array.isArray(data?.queueIntegrations) ? data.queueIntegrations : [];
        const found = items.find((it) => it.type === 'openai');
        if (found) {
          let parsed = {};
          try { parsed = found.jsonContent ? JSON.parse(found.jsonContent) : {}; } catch (_) {}
          setOpenAI({
            id: found.id,
            name: found.name || 'OpenAI Principal',
            apiKey: parsed.apiKey || '',
            model: parsed.model || 'gpt-4o-mini'
          });
        }
      } catch (err) {
        // silencioso
      }
    };
    loadOpenAI();
  }, []);

  const handleOnChangeVariable = (e) => {
    if (e.target.value !== null) {
      const changedProp = {};
      changedProp[e.target.name] = e.target.value;
      setVariable((prev) => ({ ...prev, ...changedProp }));
    }
  };

  const saveOpenAIIntegration = async () => {
    try {
      setSavingOpenAI(true);
      const payload = {
        type: 'openai',
        name: openAI.name || 'OpenAI Principal',
        projectName: 'openai',
        language: 'pt-BR',
        jsonContent: JSON.stringify({ apiKey: openAI.apiKey || '', model: openAI.model || 'gpt-4o-mini' })
      };
      if (openAI.id) {
        const { data } = await api.put(`/queueIntegration/${openAI.id}`, payload);
        toast.success('Integração OpenAI atualizada');
      } else {
        const { data } = await api.post(`/queueIntegration`, payload);
        setOpenAI((prev) => ({ ...prev, id: data?.id }));
        toast.success('Integração OpenAI criada');
      }
    } catch (err) {
      toastError(err);
    } finally {
      setSavingOpenAI(false);
    }
  };

  const handleOnChangeSettings = (e) => {
    const changedProp = {};
    changedProp[e.target.name] = e.target.value;
    setSettings((prev) => ({ ...prev, ...changedProp }));
  };

  const addVariable = () => {
    setSettings((prev) => {
      if (!Array.isArray(prev.variables)) {
        // Lidar com o caso em que prev.variables não é um array
        return { ...prev, variables: [Object.assign({}, variable)] };
      }
      const variablesExists = settings.variables.filter(
        (v) => v.key === variable.key
      );
      const variables = prev.variables;
      if (variablesExists.length === 0) {
        variables.push(Object.assign({}, variable));
        setVariable({ key: "", value: "" });
      }
      return { ...prev, variables };
    });
  };

  const removeVariable = () => {
    const newList = settings.variables.filter((v) => v.key !== selectedKey);
    setSettings((prev) => ({ ...prev, variables: newList }));
    setSelectedKey(null);
  };

  const saveSettings = async () => {
    // Monta payload garantindo tipos corretos
    const payload = { ...settings };
    // Coerção numérica
    [
      "messageInterval",
      "longerIntervalAfter",
      "greaterInterval",
      "capHourly",
      "capDaily",
      "backoffErrorThreshold",
      "backoffPauseMinutes",
    ].forEach((k) => {
      if (payload[k] !== undefined) payload[k] = Number(payload[k]);
    });

    // Supressão: converte string em array de tags normalizadas (trim) e únicas
    if (typeof suppressionTagNamesStr === "string") {
      const list = suppressionTagNamesStr
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
      payload.suppressionTagNames = Array.from(new Set(list));
    }

    await api.post("/campaign-settings", { settings: payload });
    toast.success("Configurações salvas");
  };

  const handleChange = (event) => {
    if (event.target.name === "sabado") {
      setSabado(event.target.checked);
    }
    if (event.target.name === "domingo") {
      setDomingo(event.target.checked);
    }
  };

  const handleSaveTimeMass = async () => {
    let settings = {
      sabado: sabado,
      domingo: domingo,
      startHour: startHour,
      endHour: endHour
    }

    try {
      await api.post(`/campaign-settings/`, { settings });

      toast.success(i18n.t("settings.success"));
    } catch (err) {
      toastError(err);
    }
  };

  return (
    <MainContainer>
      <ConfirmationModal
        title={i18n.t("campaigns.confirmationModal.deleteTitle")}
        open={confirmationOpen}
        onClose={() => setConfirmationOpen(false)}
        onConfirm={removeVariable}
      >
        {i18n.t("campaigns.confirmationModal.deleteMessage")}
      </ConfirmationModal>
      {
        user.profile === "user" ?
          <ForbiddenPage />
          :
          <>
            <MainHeader>
              <Grid style={{ width: "99.6%" }} container>
                <Grid xs={12} item>
                  <Title>{i18n.t("campaignsConfig.title")}</Title>
                </Grid>
              </Grid>
            </MainHeader>

            <Paper className={classes.mainPaper} variant="outlined">

              {/* <Typography component={"h1"}>Período de Disparo das Campanhas &nbsp;</Typography>
        <Paper className={classes.paper}>
          <TextField
            id="buttonText"
            label="Começar o envio que hora?"
            margin="dense"
            variant="outlined"
            fullWidth
            value={startHour}
            onChange={(e) => setStartHour(e.target.value)}
            style={{ marginRight: "10px" }}
          />

          <TextField
            id="buttonText"
            label="Terminar o envio que hora?"
            margin="dense"
            variant="outlined"
            fullWidth
            value={endHour}
            onChange={(e) => setEndHour(e.target.value)}
            style={{ marginRight: "10px" }}
          />

          <FormControlLabel
            control={<Checkbox checked={sabado} onChange={handleChange} name="sabado" />}
            label="Sábado"
          />

          <FormControlLabel
            control={<Checkbox checked={domingo} onChange={handleChange} name="domingo" />}
            label="Domigo"
          />

          <Button
            variant="contained"
            color="primary"
            className={classes.button}
            onClick={() => {
              handleSaveTimeMass();
            }}
            style={{ marginRight: "10px" }}
          >
            Salvar
          </Button>

        </Paper> */}

              <Box className={classes.tabPanelsContainer}>
                <Grid spacing={1} container>
                  <Grid xs={12} item>
                    <Typography component={"h1"} style={{ marginBottom: 8 }}>Integrações &nbsp;</Typography>
                  </Grid>
                  <Grid xs={12} item>
                    {!encryptionEnabled && (
                      <Paper className={classes.paper} variant="outlined" style={{ background: '#fff8e1', borderColor: '#ffb300', alignItems: 'stretch', flexDirection: 'column' }}>
                        <Typography style={{ fontWeight: 600, marginBottom: 4 }}>Atenção: criptografia de API Key não habilitada</Typography>
                        <Typography variant="body2">
                          Defina a variável de ambiente <b>OPENAI_ENCRYPTION_KEY</b> (ou <b>DATA_KEY</b>) no backend para que a sua API Key seja armazenada de forma criptografada.
                        </Typography>
                      </Paper>
                    )}
                    <Paper className={classes.paper} variant="outlined" style={{ alignItems: 'stretch', flexDirection: 'column' }}>
                      <Typography component={"h2"} style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                        OpenAI
                        <Tooltip
                          title={
                            <span>
                              Configure a integração para usar a API da OpenAI no atendimento e nas campanhas.<br/>
                              • A API Key é armazenada com criptografia e não será exibida novamente.<br/>
                              • O Modelo define qual modelo será usado (ex.: gpt-4o-mini).<br/>
                              • Em atendimento WhatsApp, usamos essas credenciais via serviço OpenAI já existente.
                            </span>
                          }
                          placement="right"
                        >
                          <InfoOutlinedIcon fontSize="small" style={{ opacity: 0.7 }} />
                        </Tooltip>
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={4}>
                          <TextField
                            label="Nome da Integração"
                            variant="outlined"
                            value={openAI.name}
                            onChange={(e) => setOpenAI((p) => ({ ...p, name: e.target.value }))}
                            fullWidth
                            helperText="Um rótulo para identificar esta integração (ex.: OpenAI Principal)"
                          />
                        </Grid>
                        <Grid item xs={12} md={5}>
                          <TextField
                            label="API Key"
                            variant="outlined"
                            value={openAI.apiKey}
                            onChange={(e) => setOpenAI((p) => ({ ...p, apiKey: e.target.value }))}
                            fullWidth
                            type="password"
                            placeholder="sk-..."
                            helperText="Cole sua chave da OpenAI (https://platform.openai.com). Ela será criptografada e não será exibida novamente. Se aparecer ********, manteremos a chave atual."
                          />
                        </Grid>
                        <Grid item xs={12} md={3}>
                          <TextField
                            label="Modelo"
                            variant="outlined"
                            value={openAI.model}
                            onChange={(e) => setOpenAI((p) => ({ ...p, model: e.target.value }))}
                            fullWidth
                            placeholder="gpt-4o-mini"
                            helperText="Modelo recomendado: gpt-4o-mini (custo/benefício). Outros: gpt-4o, gpt-4.1, etc."
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <Typography variant="body2" style={{ opacity: 0.8 }}>
                            Como funciona: o Whaticket usa essa integração para responder mensagens via WhatsApp (serviço OpenAI) e para gerar variações de campanhas quando não houver outra configuração específica. A chave é usada apenas no servidor.
                          </Typography>
                        </Grid>
                        <Grid item xs={12} className={classes.textRight}>
                          <Button
                            onClick={saveOpenAIIntegration}
                            color="primary"
                            variant="contained"
                            disabled={savingOpenAI}
                          >
                            {savingOpenAI ? 'Salvando...' : 'Salvar Integração OpenAI'}
                          </Button>
                        </Grid>
                      </Grid>
                    </Paper>
                  </Grid>
                  <Grid xs={12} item>
                    <Typography component={"h1"}>Intervalos &nbsp;</Typography>
                  </Grid>

                  {/* TEMPO ENTRE DISPAROS */}
                  {/* <Grid xs={12} md={3} item>
              <FormControl
                variant="outlined"
                className={classes.formControl}
                fullWidth
              >
                <InputLabel id="messageInterval-label">
                  Tempo entre Disparos
                </InputLabel>
                <Select
                  name="messageInterval"
                  id="messageInterval"
                  labelId="messageInterval-label"
                  label="Intervalo Randômico de Disparo"
                  value={settings.messageInterval}
                  onChange={(e) => handleOnChangeSettings(e)}
                >
                  <MenuItem value={0}>Sem Intervalo</MenuItem>
                  <MenuItem value={5}>5 segundos</MenuItem>
                  <MenuItem value={10}>10 segundos</MenuItem>
                  <MenuItem value={15}>15 segundos</MenuItem>
                  <MenuItem value={20}>20 segundos</MenuItem>
                </Select>
              </FormControl>
            </Grid> */}

                  <Grid xs={12} md={3} item>
                    <FormControl
                      variant="outlined"
                      className={classes.formControl}
                      fullWidth
                    >
                      <InputLabel id="messageInterval-label">
                        {i18n.t("campaigns.settings.randomInterval")}
                      </InputLabel>
                      <Select
                        name="messageInterval"
                        id="messageInterval"
                        labelId="messageInterval-label"
                        label={i18n.t("campaigns.settings.randomInterval")}
                        value={settings.messageInterval}
                        onChange={(e) => handleOnChangeSettings(e)}
                      >
                        <MenuItem value={0}>{i18n.t("campaigns.settings.noBreak")}</MenuItem>
                        <MenuItem value={5}>5 segundos</MenuItem>
                        <MenuItem value={10}>10 segundos</MenuItem>
                        <MenuItem value={15}>15 segundos</MenuItem>
                        <MenuItem value={20}>20 segundos</MenuItem>
                        <MenuItem value={30}>30 segundos</MenuItem>
                        <MenuItem value={40}>40 segundos</MenuItem>
                        <MenuItem value={60}>60 segundos</MenuItem>
                        <MenuItem value={80}>80 segundos</MenuItem>
                        <MenuItem value={100}>100 segundos</MenuItem>
                        <MenuItem value={120}>120 segundos</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid xs={12} md={3} item>
                    <FormControl
                      variant="outlined"
                      className={classes.formControl}
                      fullWidth
                    >
                      <InputLabel id="longerIntervalAfter-label">
                        {i18n.t("campaigns.settings.intervalGapAfter")}
                      </InputLabel>
                      <Select
                        name="longerIntervalAfter"
                        id="longerIntervalAfter"
                        labelId="longerIntervalAfter-label"
                        label={i18n.t("campaigns.settings.intervalGapAfter")}
                        value={settings.longerIntervalAfter}
                        onChange={(e) => handleOnChangeSettings(e)}
                      >
                        <MenuItem value={0}>{i18n.t("campaigns.settings.undefined")}</MenuItem>
                        <MenuItem value={5}>5 {i18n.t("campaigns.settings.messages")}</MenuItem>
                        <MenuItem value={10}>10 {i18n.t("campaigns.settings.messages")}</MenuItem>
                        <MenuItem value={15}>15 {i18n.t("campaigns.settings.messages")}</MenuItem>
                        <MenuItem value={20}>20 {i18n.t("campaigns.settings.messages")}</MenuItem>
                        <MenuItem value={30}>30 {i18n.t("campaigns.settings.messages")}</MenuItem>
                        <MenuItem value={40}>40 {i18n.t("campaigns.settings.messages")}</MenuItem>
                        <MenuItem value={50}>50 {i18n.t("campaigns.settings.messages")}</MenuItem>
                        <MenuItem value={60}>60 {i18n.t("campaigns.settings.messages")}</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid xs={12} md={3} item>
                    <FormControl
                      variant="outlined"
                      className={classes.formControl}
                      fullWidth
                    >
                      <InputLabel id="greaterInterval-label">
                        {i18n.t("campaigns.settings.laggerTriggerRange")}
                      </InputLabel>
                      <Select
                        name="greaterInterval"
                        id="greaterInterval"
                        labelId="greaterInterval-label"
                        label={i18n.t("campaigns.settings.laggerTriggerRange")}
                        value={settings.greaterInterval}
                        onChange={(e) => handleOnChangeSettings(e)}
                      >
                        <MenuItem value={0}>{i18n.t("campaigns.settings.noBreak")}</MenuItem>
                        <MenuItem value={20}>20 segundos</MenuItem>
                        <MenuItem value={30}>30 segundos</MenuItem>
                        <MenuItem value={40}>40 segundos</MenuItem>
                        <MenuItem value={50}>50 segundos</MenuItem>
                        <MenuItem value={60}>60 segundos</MenuItem>
                        <MenuItem value={70}>70 segundos</MenuItem>
                        <MenuItem value={80}>80 segundos</MenuItem>
                        <MenuItem value={90}>90 segundos</MenuItem>
                        <MenuItem value={100}>100 segundos</MenuItem>
                        <MenuItem value={110}>110 segundos</MenuItem>
                        <MenuItem value={120}>120 segundos</MenuItem>
                        <MenuItem value={130}>130 segundos</MenuItem>
                        <MenuItem value={140}>140 segundos</MenuItem>
                        <MenuItem value={150}>150 segundos</MenuItem>
                        <MenuItem value={160}>160 segundos</MenuItem>
                        <MenuItem value={170}>170 segundos</MenuItem>
                        <MenuItem value={180}>180 segundos</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  {/* Limites e Backoff */}
                  <Grid xs={12} item>
                    <Typography component={"h1"} style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 8 }}>
                      Limites e Backoff
                      <Tooltip
                        title={
                          <span>
                            Defina limites por conexão para reduzir risco de banimento.<br/>
                            Recomendações: por hora 100-300, por dia 800-2000, dependendo do aquecimento e reputação.<br/>
                            Backoff: após N erros consecutivos, pausar alguns minutos.
                          </span>
                        }
                        placement="right"
                      >
                        <InfoOutlinedIcon fontSize="small" style={{ opacity: 0.7 }} />
                      </Tooltip>
                    </Typography>
                  </Grid>
                  <Grid xs={12} md={3} item>
                    <TextField
                      label="Limite por hora (mensagens/conexão)"
                      variant="outlined"
                      name="capHourly"
                      type="number"
                      value={settings.capHourly || 300}
                      onChange={handleOnChangeSettings}
                      fullWidth
                      inputProps={{ min: 10 }}
                      helperText="Sugestão: iniciar entre 100 e 300 por hora e ajustar conforme desempenho"
                    />
                  </Grid>
                  <Grid xs={12} md={3} item>
                    <TextField
                      label="Limite por dia (mensagens/conexão)"
                      variant="outlined"
                      name="capDaily"
                      type="number"
                      value={settings.capDaily || 2000}
                      onChange={handleOnChangeSettings}
                      fullWidth
                      inputProps={{ min: 50 }}
                      helperText="Sugestão: 800 a 2000 por dia por conexão; evite picos"
                    />
                  </Grid>
                  <Grid xs={12} md={3} item>
                    <TextField
                      label="Backoff após N erros"
                      variant="outlined"
                      name="backoffErrorThreshold"
                      type="number"
                      value={settings.backoffErrorThreshold || 5}
                      onChange={handleOnChangeSettings}
                      fullWidth
                      inputProps={{ min: 1 }}
                      helperText="Ao atingir este número de erros seguidos, pausamos o envio (backoff)"
                    />
                  </Grid>
                  <Grid xs={12} md={3} item>
                    <TextField
                      label="Pausa de backoff (minutos)"
                      variant="outlined"
                      name="backoffPauseMinutes"
                      type="number"
                      value={settings.backoffPauseMinutes || 10}
                      onChange={handleOnChangeSettings}
                      fullWidth
                      inputProps={{ min: 1 }}
                      helperText="Tempo de pausa após acionar o backoff; aumente se persistirem erros"
                    />
                  </Grid>
                  {/* Lista de Supressão */}
                  <Grid xs={12} item>
                    <Typography component={"h1"} style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 8 }}>
                      Supressão (não enviar para contatos com estas tags)
                      <Tooltip
                        title={
                          <span>
                            Evite enviar para opt-outs ou bloqueados. Configure tags como DNC, SAIR, CANCELAR.<br/>
                            A supressão reduz denúncias e melhora a reputação de envio.
                          </span>
                        }
                        placement="right"
                      >
                        <InfoOutlinedIcon fontSize="small" style={{ opacity: 0.7 }} />
                      </Tooltip>
                    </Typography>
                  </Grid>
                  <Grid xs={12} item>
                    <TextField
                      label="Tags separadas por vírgula (ex: DNC, SAIR, CANCELAR)"
                      variant="outlined"
                      value={suppressionTagNamesStr}
                      onChange={(e) => setSuppressionTagNamesStr(e.target.value)}
                      fullWidth
                      helperText="Separe por vírgulas; usamos correspondência exata das tags do contato"
                    />
                  </Grid>
                  <Grid xs={12} className={classes.textRight} item>
                    {/* <Button
                onClick={() => setShowVariablesForm(!showVariablesForm)}
                color="primary"
                style={{ marginRight: 10 }}
              >
                {i18n.t("campaigns.settings.addVar")}
              </Button> */}
                    <Button
                      onClick={saveSettings}
                      color="primary"
                      variant="contained"
                    >
                      {i18n.t("campaigns.settings.save")}
                    </Button>
                  </Grid>
                  {/* {showVariablesForm && (
              <>
                <Grid xs={12} md={6} item>
                  <TextField
                    label={i18n.t("campaigns.settings.shortcut")}
                    variant="outlined"
                    value={variable.key}
                    name="key"
                    onChange={handleOnChangeVariable}
                    fullWidth
                  />
                </Grid>
                <Grid xs={12} md={6} item>
                  <TextField
                    label={i18n.t("campaigns.settings.content")}
                    variant="outlined"
                    value={variable.value}
                    name="value"
                    onChange={handleOnChangeVariable}
                    fullWidth
                  />
                </Grid>
                <Grid xs={12} className={classes.textRight} item>
                  <Button
                    onClick={() => setShowVariablesForm(!showVariablesForm)}
                    color="primary"
                    style={{ marginRight: 10 }}
                  >
                    {i18n.t("campaigns.settings.close")}
                  </Button>
                  <Button
                    onClick={addVariable}
                    color="primary"
                    variant="contained"
                  >
                    {i18n.t("campaigns.settings.add")}
                  </Button>
                </Grid>
              </>
            )}
            {settings.variables.length > 0 && (
              <Grid xs={12} className={classes.textRight} item>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell style={{ width: "1%" }}></TableCell>
                      <TableCell>{i18n.t("campaigns.settings.shortcut")}
                      </TableCell>
                      <TableCell>{i18n.t("campaigns.settings.content")}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Array.isArray(settings.variables) &&
                      settings.variables.map((v, k) => (
                        <TableRow key={k}>
                          <TableCell>
                            <IconButton
                              size="small"
                              onClick={() => {
                                setSelectedKey(v.key);
                                setConfirmationOpen(true);
                              }}
                            >
                              <DeleteOutlineIcon />
                            </IconButton>
                          </TableCell>
                          <TableCell>{"{" + v.key + "}"}</TableCell>
                          <TableCell>{v.value}</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </Grid>
            )} */}
                </Grid>
              </Box>
            </Paper>
          </>}
    </MainContainer>
  );
};

export default CampaignsConfig;
