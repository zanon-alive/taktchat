import React, { useState, useEffect, useRef } from "react";
import * as Yup from "yup";
import { Formik, Form, Field } from "formik";
import { toast } from "react-toastify";
import { makeStyles } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import CircularProgress from "@material-ui/core/CircularProgress";
import { i18n } from "../../translate/i18n";
import { MenuItem, FormControl, InputLabel, Select, Tooltip, Typography, Paper, Popover, ClickAwayListener, Link, Chip, Checkbox, FormControlLabel, List, ListItem, ListItemText, Collapse } from "@material-ui/core";
import ExpandLess from "@material-ui/icons/ExpandLess";
import ExpandMore from "@material-ui/icons/ExpandMore";
import InfoOutlinedIcon from "@material-ui/icons/InfoOutlined";
import { Visibility, VisibilityOff } from "@material-ui/icons";
import { InputAdornment, IconButton } from "@material-ui/core";
import QueueSelectSingle from "../QueueSelectSingle";
import api from "../../services/api";
import toastError from "../../errors/toastError";

const useStyles = makeStyles(theme => ({
  root: {
    display: "flex",
    flexWrap: "wrap",
  },
  multFieldLine: {
    display: "flex",
    "& > *:not(:last-child)": {
      marginRight: theme.spacing(1),
    },
  },
  btnWrapper: {
    position: "relative",
  },
  buttonProgress: {
    color: green[500],
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -12,
    marginLeft: -12,
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  colorAdorment: {
    width: 20,
    height: 20,
  },
}));

// Alinhar a lista de modelos com o backend
const allowedModels = [
  "gpt-3.5-turbo-1106",
  "gpt-4o",
  "gemini-1.5-flash",
  "gemini-1.5-pro",
  "gemini-2.0-flash",
  "gemini-2.0-pro",
];

const PromptSchema = Yup.object().shape({
  name: Yup.string()
    .min(5, "Muito curto!")
    .max(100, "Muito longo!")
    .required("Obrigatório"),
  prompt: Yup.string()
    .min(50, "Muito curto!")
    .required("Descreva o treinamento para Inteligência Artificial"),
  model: Yup.string()
    .oneOf(allowedModels, "Modelo inválido")
    .required("Informe o modelo"),
  maxTokens: Yup.number()
    .min(10, "Mínimo 10 tokens")
    .max(4096, "Máximo 4096 tokens")
    .required("Informe o número máximo de tokens"),
  temperature: Yup.number()
    .min(0, "Mínimo 0")
    .max(1, "Máximo 1")
    .required("Informe a temperatura"),
  apiKey: Yup.string().required("Informe a API Key"),
  queueId: Yup.number().required("Informe a fila"),
  maxMessages: Yup.number()
    .min(1, "Mínimo 1 mensagem")
    .max(50, "Máximo 50 mensagens")
    .required("Informe o número máximo de mensagens"),
  voice: Yup.string().when("model", {
    is: "gpt-3.5-turbo-1106",
    then: Yup.string().required("Informe o modo para Voz"),
    otherwise: Yup.string().notRequired(),
  }),
  voiceKey: Yup.string().notRequired(),
  voiceRegion: Yup.string().notRequired(),
});

const PromptModal = ({ open, onClose, promptId }) => {
  const classes = useStyles();
  const [showApiKey, setShowApiKey] = useState(false);
  const [encryptionEnabled, setEncryptionEnabled] = useState(true);

  const handleToggleApiKey = () => {
    setShowApiKey(!showApiKey);
  };

  const initialState = {
    name: "",
    prompt: "",
    model: "gpt-3.5-turbo-1106",
    voice: "texto",
    voiceKey: "",
    voiceRegion: "",
    maxTokens: 100,
    temperature: 1,
    apiKey: "",
    queueId: null,
    maxMessages: 10,
  };

  const [prompt, setPrompt] = useState(initialState);
  const promptInputRef = useRef(null);
  const [tagsAnchorEl, setTagsAnchorEl] = useState(null);
  const [tagsSearch, setTagsSearch] = useState("");
  const [filesSearch, setFilesSearch] = useState("");
  const [fileLists, setFileLists] = useState([]);
  const [expandedFileIds, setExpandedFileIds] = useState({});
  const [selectedOptions, setSelectedOptions] = useState([]); // [{fileListId, optionId, name, path, mediaType}]
  const [voiceTipsAnchorEl, setVoiceTipsAnchorEl] = useState(null);

  const openVoiceTips = Boolean(voiceTipsAnchorEl);
  const handleOpenVoiceTips = (event) => setVoiceTipsAnchorEl(event.currentTarget);
  const handleCloseVoiceTips = () => setVoiceTipsAnchorEl(null);

  const mustacheVars = [
    // Contato
    { key: "firstName", label: "firstName", desc: "Primeiro nome do contato", category: "Contato", alias: "#primeiro-nome" },
    { key: "name", label: "name", desc: "Nome completo do contato", category: "Contato", alias: "#nome" },
    { key: "email", label: "email", desc: "Email do contato", category: "Contato", alias: "#email" },
    { key: "cpfCnpj", label: "cpfCnpj", desc: "CPF/CNPJ do contato", category: "Contato", alias: "#cnpj-cpf" },
    { key: "representativeCode", label: "representativeCode", desc: "Código do representante", category: "Contato", alias: "#codigo-representante" },
    { key: "city", label: "city", desc: "Cidade", category: "Contato", alias: "#cidade" },
    { key: "situation", label: "situation", desc: "Situação do cliente", category: "Contato", alias: "#situacao" },
    { key: "fantasyName", label: "fantasyName", desc: "Nome fantasia", category: "Contato", alias: "#fantasia" },
    { key: "foundationDate", label: "foundationDate", desc: "Data de fundação (DD-MM-YYYY)", category: "Contato", alias: "#data-fundacao" },
    { key: "creditLimit", label: "creditLimit", desc: "Limite de crédito", category: "Contato", alias: "#limite-credito" },
    { key: "segment", label: "segment", desc: "Segmento de mercado", category: "Contato", alias: "#segmento" },

    // Atendimento
    { key: "ticket_id", label: "ticket_id", desc: "ID do ticket", category: "Atendimento", alias: "#ticket" },
    { key: "userName", label: "userName", desc: "Nome do atendente", category: "Atendimento", alias: "#atendente" },
    { key: "queue", label: "queue", desc: "Nome da fila", category: "Atendimento", alias: "#fila" },
    { key: "connection", label: "connection", desc: "Nome da conexão/WhatsApp", category: "Atendimento", alias: "#conexao" },
    { key: "protocol", label: "protocol", desc: "Protocolo único da conversa", category: "Atendimento", alias: "#protocolo" },

    // Data/Hora
    { key: "date", label: "date", desc: "Data atual (DD-MM-YYYY)", category: "Data/Hora", alias: "#data" },
    { key: "hour", label: "hour", desc: "Hora atual (HH:MM:SS)", category: "Data/Hora", alias: "#hora" },
    { key: "data_hora", label: "data_hora", desc: "Data e hora juntas (ex.: 01-01-2025 às 10:30:00)", category: "Data/Hora", alias: "#data-hora" },

    // Saudação
    { key: "ms", label: "ms", desc: "Saudação contextual (Bom dia/Boa tarde/Boa noite/Boa madrugada)", category: "Saudação/Contexto", alias: "#saudacao" },
    { key: "saudacao", label: "saudacao", desc: "Alias de ms (saudação contextual)", category: "Saudação/Contexto", alias: "#saudacao" },
    { key: "periodo_dia", label: "periodo_dia", desc: "Período do dia: manhã, tarde, noite ou madrugada", category: "Saudação/Contexto", alias: "#periodo-dia" },

    // Empresa
    { key: "name_company", label: "name_company", desc: "Nome da empresa", category: "Empresa", alias: "#empresa" },
  ];

  const groupedVars = mustacheVars.reduce((acc, v) => {
    const cat = v.category || "Outros";
    acc[cat] = acc[cat] || [];
    acc[cat].push(v);
    return acc;
  }, {});

  const openTags = Boolean(tagsAnchorEl);
  const handleOpenTags = (event) => setTagsAnchorEl(event.currentTarget);
  const handleCloseTags = () => setTagsAnchorEl(null);

  const insertAtCursor = (text, setFieldValue, values) => {
    const textarea = promptInputRef.current;
    const insertion = `{{${text}}}`;
    if (textarea && typeof textarea.selectionStart === "number") {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const before = values.prompt.slice(0, start);
      const after = values.prompt.slice(end);
      const next = before + insertion + after;
      setFieldValue("prompt", next);
      // reposiciona o cursor após a inserção
      requestAnimationFrame(() => {
        textarea.focus();
        const pos = start + insertion.length;
        textarea.setSelectionRange(pos, pos);
      });
    } else {
      setFieldValue("prompt", (values.prompt || "") + insertion);
    }
  };

  useEffect(() => {
    // status da criptografia
    const loadEncryptionStatus = async () => {
      try {
        const { data } = await api.get('/ai/encryption-status');
        setEncryptionEnabled(Boolean(data?.encryptionEnabled));
      } catch (_) {
        setEncryptionEnabled(true); // assume habilitado se não conseguir verificar
      }
    };
    loadEncryptionStatus();

    const fetchPrompt = async () => {
      if (!promptId) {
        setPrompt(initialState);
        return;
      }
      try {
        const { data } = await api.get(`/prompt/${promptId}`);
        setPrompt({
          ...initialState,
          ...data,
          queueId: data.queueId || null, // Garantir que queueId seja definido
          model: allowedModels.includes(data.model) ? data.model : "gpt-3.5-turbo-1106", // Validação de modelo
        });
        // Restaurar anexos selecionados, se houver
        try {
          if (data.attachments) {
            const parsed = typeof data.attachments === 'string' ? JSON.parse(data.attachments) : data.attachments;
            if (Array.isArray(parsed)) setSelectedOptions(parsed);
          } else {
            setSelectedOptions([]);
          }
        } catch (_) {
          setSelectedOptions([]);
        }
      } catch (err) {
        toastError(err);
      }
    };

    fetchPrompt();

    // carregar lista simples de arquivos
    const fetchFiles = async () => {
      try {
        const { data } = await api.get(`/files/list`, { params: { searchParam: filesSearch } });
        setFileLists(Array.isArray(data) ? data : []);
      } catch (err) {
        // silencioso
      }
    };
    fetchFiles();
  }, [promptId, open]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const { data } = await api.get(`/files/list`, { params: { searchParam: filesSearch } });
        if (active) setFileLists(Array.isArray(data) ? data : []);
      } catch (_) {}
    })();
    return () => { active = false; };
  }, [filesSearch]);

  const handleClose = () => {
    setPrompt(initialState);
    setSelectedOptions([]);
    onClose();
  };

  const handleSavePrompt = async (values, { setSubmitting, setErrors }) => {
    try {
      const promptData = {
        ...values,
        voice: values.model === "gpt-3.5-turbo-1106" ? values.voice : "texto",
        attachments: JSON.stringify(selectedOptions || []),
      };
      if (promptId) {
        await api.put(`/prompt/${promptId}`, promptData);
      } else {
        await api.post("/prompt", promptData);
      }
      toast.success(i18n.t("promptModal.success"));
      handleClose();
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Erro ao salvar o prompt";
      toastError(errorMessage);
      try {
        const parsedError = JSON.parse(errorMessage);
        if (parsedError.errors) {
          const fieldErrors = {};
          parsedError.errors.forEach(error => {
            if (error.includes("NAME")) fieldErrors.name = error;
            if (error.includes("PROMPT")) fieldErrors.prompt = error;
            if (error.includes("MODEL")) fieldErrors.model = error;
            if (error.includes("TOKENS")) fieldErrors.maxTokens = error;
            if (error.includes("TEMPERATURE")) fieldErrors.temperature = error;
            if (error.includes("APIKEY")) fieldErrors.apiKey = error;
            if (error.includes("QUEUEID")) fieldErrors.queueId = error;
            if (error.includes("MESSAGES")) fieldErrors.maxMessages = error;
            if (error.includes("VOICE")) fieldErrors.voice = error;
          });
          setErrors(fieldErrors);
        }
      } catch (jsonError) {
        // Se não for um JSON, apenas exibir o erro genérico
      }
      setSubmitting(false);
    }
  };

  return (
    <div className={classes.root}>
      <Dialog open={open} onClose={handleClose} maxWidth="md" scroll="paper" fullWidth>
        <DialogTitle id="form-dialog-title">
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {promptId ? i18n.t("promptModal.title.edit") : i18n.t("promptModal.title.add")}
            <Tooltip
              title={(
                <span>
                  Crie prompts para uso com modelos de IA no WhatsApp e campanhas.<br/>
                  • A API Key é usada somente no servidor e será criptografada se a criptografia estiver habilitada.<br/>
                  • Use variáveis no texto, por exemplo: {"{nome}"} {"{empresa}"}.
                </span>
              )}
              placement="right"
            >
              <InfoOutlinedIcon fontSize="small" style={{ opacity: 0.7 }} />
            </Tooltip>
          </span>
        </DialogTitle>
        <Formik
          initialValues={prompt}
          enableReinitialize={true}
          validationSchema={PromptSchema}
          onSubmit={handleSavePrompt}
        >
          {({ touched, errors, isSubmitting, values, setFieldValue }) => (
            <Form style={{ width: "100%" }}>
              <DialogContent dividers>
                {!encryptionEnabled && (
                  <Paper variant="outlined" style={{ background: '#fff8e1', borderColor: '#ffb300', padding: 8, marginBottom: 12 }}>
                    <Typography style={{ fontWeight: 600, marginBottom: 4 }}>Atenção: criptografia de API Key não habilitada</Typography>
                    <Typography variant="body2">
                      Defina a variável de ambiente <b>OPENAI_ENCRYPTION_KEY</b> (ou <b>DATA_KEY</b>) no backend para que a sua API Key seja armazenada de forma criptografada.
                    </Typography>
                  </Paper>
                )}
                <Typography variant="body2" style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <InfoOutlinedIcon fontSize="small" style={{ opacity: 0.7 }} />
                  Preencha os campos abaixo. Dica: personalize o texto do Prompt usando variáveis como {"{nome}"}, {"{pedido}"}.
                </Typography>
                <Field
                  as={TextField}
                  label={i18n.t("promptModal.form.name")}
                  name="name"
                  error={touched.name && Boolean(errors.name)}
                  helperText={touched.name ? errors.name : "Um rótulo para identificar este Prompt (ex.: Boas-vindas)"}
                  variant="outlined"
                  margin="dense"
                  fullWidth
                  required
                />
                <FormControl fullWidth margin="dense" variant="outlined">
                  <Field
                    as={TextField}
                    label={i18n.t("promptModal.form.apikey")}
                    name="apiKey"
                    type={showApiKey ? "text" : "password"}
                    error={touched.apiKey && Boolean(errors.apiKey)}
                    helperText={touched.apiKey ? errors.apiKey : "Cole sua chave (ex.: sk-...). Ela é usada apenas no servidor e fica oculta após salvar."}
                    variant="outlined"
                    margin="dense"
                    fullWidth
                    required
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={handleToggleApiKey}>
                            {showApiKey ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </FormControl>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="caption" style={{ opacity: 0.8 }}>Prompt</Typography>
                  <Link component="button" type="button" onClick={handleOpenTags} onMouseEnter={handleOpenTags} style={{ fontSize: 12 }}>
                    #Tags
                  </Link>
                </div>
                <div style={{ marginTop: 12 }}>
                  <Typography variant="subtitle2" style={{ marginBottom: 4 }}>Anexos do Prompt (biblioteca de arquivos)</Typography>
                  <TextField
                    value={filesSearch}
                    onChange={e => setFilesSearch(e.target.value)}
                    placeholder="Buscar listas de arquivos..."
                    variant="outlined"
                    size="small"
                    fullWidth
                    style={{ marginBottom: 8 }}
                  />
                  <Paper variant="outlined" style={{ maxHeight: 220, overflow: 'auto' }}>
                    <List dense>
                      {fileLists.map(fl => {
                        const open = !!expandedFileIds[fl.id];
                        return (
                          <div key={fl.id}>
                            <ListItem button onClick={async () => {
                              setExpandedFileIds(prev => ({ ...prev, [fl.id]: !open }));
                              if (!open) {
                                try {
                                  const { data } = await api.get(`/files/${fl.id}`);
                                  setExpandedFileIds(prev => ({ ...prev, [fl.id]: data }));
                                } catch (_) {}
                              }
                            }}>
                              <ListItemText primary={fl.name} secondary={fl.message} />
                              {open ? <ExpandLess /> : <ExpandMore />}
                            </ListItem>
                            <Collapse in={!!expandedFileIds[fl.id]} timeout="auto" unmountOnExit>
                              <List dense component="div" disablePadding>
                                {(expandedFileIds[fl.id]?.options || []).map(opt => {
                                  const checked = selectedOptions.some(s => s.fileListId === fl.id && s.optionId === opt.id);
                                  return (
                                    <ListItem key={opt.id} style={{ paddingLeft: 28 }}>
                                      <FormControlLabel
                                        control={
                                          <Checkbox
                                            color="primary"
                                            checked={checked}
                                            onChange={(e) => {
                                              setSelectedOptions(prev => {
                                                if (e.target.checked) {
                                                  return [...prev, { fileListId: fl.id, optionId: opt.id, name: opt.name, path: opt.path, mediaType: opt.mediaType }];
                                                }
                                                return prev.filter(s => !(s.fileListId === fl.id && s.optionId === opt.id));
                                              });
                                            }}
                                          />
                                        }
                                        label={opt.name || opt.path || `Opção ${opt.id}`}
                                      />
                                    </ListItem>
                                  );
                                })}
                              </List>
                            </Collapse>
                          </div>
                        );
                      })}
                    </List>
                  </Paper>
                  {!!selectedOptions.length && (
                    <Typography variant="caption" style={{ display: 'block', marginTop: 4 }}>
                      Selecionados: {selectedOptions.length}
                    </Typography>
                  )}
                </div>
                <Field
                  as={TextField}
                  label={i18n.t("promptModal.form.prompt")}
                  name="prompt"
                  error={touched.prompt && Boolean(errors.prompt)}
                  helperText={touched.prompt ? errors.prompt : "Escreva as instruções do atendente IA. Você pode usar variáveis para personalizar a mensagem."}
                  variant="outlined"
                  margin="dense"
                  fullWidth
                  required
                  rows={10}
                  multiline
                  inputRef={promptInputRef}
                />
                <ClickAwayListener onClickAway={handleCloseTags}>
                  <Popover
                    open={openTags}
                    anchorEl={tagsAnchorEl}
                    onClose={handleCloseTags}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                    transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                    disableRestoreFocus
                  >
                    <div style={{ padding: 12, maxWidth: 520 }}>
                      <Typography variant="subtitle2" style={{ marginBottom: 8 }}>Tags disponíveis para uso</Typography>
                      <TextField
                        value={tagsSearch}
                        onChange={e => setTagsSearch(e.target.value)}
                        placeholder="Filtrar tags..."
                        variant="outlined"
                        size="small"
                        fullWidth
                        style={{ marginBottom: 12 }}
                      />
                      {Object.keys(groupedVars).map(cat => {
                        const list = groupedVars[cat].filter(v => {
                          const q = (tagsSearch || "").toLowerCase();
                          if (!q) return true;
                          return (
                            v.label.toLowerCase().includes(q) ||
                            (v.desc && v.desc.toLowerCase().includes(q)) ||
                            (v.alias && v.alias.toLowerCase().includes(q))
                          );
                        });
                        if (!list.length) return null;
                        return (
                          <div key={cat} style={{ marginBottom: 12 }}>
                            <Chip label={cat} size="small" color="default" style={{ marginBottom: 8 }} />
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                              {list.map(v => (
                                <div key={v.key} style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                                  <Tooltip title={v.desc} placement="top" arrow>
                                    <Button size="small" variant="text" onClick={() => insertAtCursor(v.label, setFieldValue, values)} style={{ textTransform: 'none' }}>
                                      {v.alias || `#${v.label}`}
                                    </Button>
                                  </Tooltip>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </Popover>
                </ClickAwayListener>
                <Field
                  name="queueId"
                  component={({ field, form }) => (
                    <QueueSelectSingle
                      selectedQueueId={field.value}
                      onChange={value => form.setFieldValue("queueId", value)}
                    />
                  )}
                />
                <div className={classes.multFieldLine}>
                  <FormControl fullWidth margin="dense" variant="outlined" error={touched.model && Boolean(errors.model)}>
                    <InputLabel>{i18n.t("promptModal.form.model")}</InputLabel>
                    <Field
                      as={Select}
                      label={i18n.t("promptModal.form.model")}
                      name="model"
                      onChange={e => {
                        setFieldValue("model", e.target.value);
                        if (e.target.value !== "gpt-3.5-turbo-1106") {
                          setFieldValue("voice", "texto");
                        }
                      }}
                    >
                      {allowedModels.map(model => (
                        <MenuItem key={model} value={model}>
                          {model === "gpt-3.5-turbo-1106" && "GPT 3.5 Turbo"}
                          {model === "gpt-4o" && "GPT 4o"}
                          {model === "gemini-1.5-flash" && "Gemini 1.5 Flash"}
                          {model === "gemini-1.5-pro" && "Gemini 1.5 Pro"}
                          {model === "gemini-2.0-flash" && "Gemini 2.0 Flash"}
                          {model === "gemini-2.0-pro" && "Gemini 2.0 Pro"}
                        </MenuItem>
                      ))}
                    </Field>
                    {touched.model && errors.model && (
                      <div style={{ color: "red", fontSize: "12px" }}>{errors.model}</div>
                    )}
                    <Typography variant="caption" style={{ marginTop: 4, opacity: 0.8 }}>
                      Sugestão: GPT 4o para melhor qualidade; 3.5 Turbo para menor custo; Gemini 1.5 para contextos longos.
                    </Typography>
                  </FormControl>
                  <FormControl
                    fullWidth
                    margin="dense"
                    variant="outlined"
                    disabled={values.model !== "gpt-3.5-turbo-1106"}
                    error={touched.voice && Boolean(errors.voice)}
                  >
                    <InputLabel>{i18n.t("promptModal.form.voice")}</InputLabel>
                    <Field
                      as={Select}
                      label={i18n.t("promptModal.form.voice")}
                      name="voice"
                    >
                      <MenuItem value="texto">Texto</MenuItem>
                      <MenuItem value="pt-BR-FranciscaNeural">Francisca</MenuItem>
                      <MenuItem value="pt-BR-AntonioNeural">Antônio</MenuItem>
                      <MenuItem value="pt-BR-BrendaNeural">Brenda</MenuItem>
                      <MenuItem value="pt-BR-DonatoNeural">Donato</MenuItem>
                      <MenuItem value="pt-BR-ElzaNeural">Elza</MenuItem>
                      <MenuItem value="pt-BR-FabioNeural">Fábio</MenuItem>
                      <MenuItem value="pt-BR-GiovannaNeural">Giovanna</MenuItem>
                      <MenuItem value="pt-BR-HumbertoNeural">Humberto</MenuItem>
                      <MenuItem value="pt-BR-JulioNeural">Julio</MenuItem>
                      <MenuItem value="pt-BR-LeilaNeural">Leila</MenuItem>
                      <MenuItem value="pt-BR-LeticiaNeural">Letícia</MenuItem>
                      <MenuItem value="pt-BR-ManuelaNeural">Manuela</MenuItem>
                      <MenuItem value="pt-BR-NicolauNeural">Nicolau</MenuItem>
                      <MenuItem value="pt-BR-ValerioNeural">Valério</MenuItem>
                      <MenuItem value="pt-BR-YaraNeural">Yara</MenuItem>
                    </Field>
                    {touched.voice && errors.voice && (
                      <div style={{ color: "red", fontSize: "12px" }}>{errors.voice}</div>
                    )}
                  </FormControl>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
                  <Typography variant="subtitle2">Voz (TTS) e Transcrição (STT)</Typography>
                  <Link
                    component="button"
                    type="button"
                    onClick={handleOpenVoiceTips}
                    onMouseEnter={handleOpenVoiceTips}
                    style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}
                  >
                    <InfoOutlinedIcon fontSize="small" style={{ opacity: 0.7 }} /> Dicas de uso
                  </Link>
                </div>
                <ClickAwayListener onClickAway={handleCloseVoiceTips}>
                  <Popover
                    open={openVoiceTips}
                    anchorEl={voiceTipsAnchorEl}
                    onClose={handleCloseVoiceTips}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                    transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                    disableRestoreFocus
                  >
                    <div style={{ padding: 12, maxWidth: 560 }}>
                      <Typography variant="subtitle2" style={{ marginBottom: 8 }}>Como configurar áudio para texto (STT) e texto para áudio (TTS)</Typography>
                      <Typography variant="body2" gutterBottom>
                        • STT (Transcrição): configure a chave no backend em <b>Setting.apiTranscription</b> usando um provedor suportado (OpenAI Whisper ou Google Gemini).<br/>
                        • TTS (Síntese de Voz): preencha abaixo <b>voice</b> (uma voz Azure válida), <b>voiceKey</b> e <b>voiceRegion</b>.
                      </Typography>
                      <Typography variant="body2" gutterBottom>
                        <b>Passos rápidos</b><br/>
                        1) Escolha o provedor de STT e gere a API Key:<br/>
                        — OpenAI: <Link href="https://platform.openai.com" target="_blank" rel="noopener">https://platform.openai.com</Link><br/>
                        — Google Gemini: <Link href="https://ai.google.dev/" target="_blank" rel="noopener">https://ai.google.dev/</Link><br/>
                        Salve a chave em <b>Setting.apiTranscription</b> no sistema.
                      </Typography>
                      <Typography variant="body2" gutterBottom>
                        2) Para TTS (Microsoft Azure Speech):<br/>
                        — Crie um recurso <i>Speech</i> no Azure Portal.<br/>
                        — Copie <b>Key</b> e <b>Region</b> (ex.: brazilsouth, eastus).<br/>
                        — Selecione uma voz, por exemplo: <code>pt-BR-AntonioNeural</code> ou <code>pt-BR-FranciscaNeural</code>.<br/>
                        Docs: <Link href="https://learn.microsoft.com/azure/ai-services/speech-service/" target="_blank" rel="noopener">Azure Speech Service</Link>
                      </Typography>
                      <Typography variant="body2" gutterBottom>
                        3) Funcionamento:<br/>
                        — Ao receber um áudio, o sistema usa a chave de STT para transcrever.<br/>
                        — A IA responde usando o <b>model</b> definido neste Prompt.<br/>
                        — Se <b>voice</b> = "texto", envia resposta em texto; caso contrário, gera áudio via Azure TTS e envia o MP3.
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Dica: se você não precisa de áudio de retorno, deixe <b>voice = "texto"</b> e não preencha <b>voiceKey/voiceRegion</b>.
                      </Typography>
                    </div>
                  </Popover>
                </ClickAwayListener>
                <div className={classes.multFieldLine}>
                  <Field
                    as={TextField}
                    label={i18n.t("promptModal.form.voiceKey")}
                    name="voiceKey"
                    error={touched.voiceKey && Boolean(errors.voiceKey)}
                    helperText={touched.voiceKey && errors.voiceKey}
                    variant="outlined"
                    margin="dense"
                    fullWidth
                    disabled={values.model !== "gpt-3.5-turbo-1106"}
                  />
                  <Field
                    as={TextField}
                    label={i18n.t("promptModal.form.voiceRegion")}
                    name="voiceRegion"
                    error={touched.voiceRegion && Boolean(errors.voiceRegion)}
                    helperText={touched.voiceRegion && errors.voiceRegion}
                    variant="outlined"
                    margin="dense"
                    fullWidth
                    disabled={values.model !== "gpt-3.5-turbo-1106"}
                  />
                </div>
                <div className={classes.multFieldLine}>
                  <Field
                    as={TextField}
                    label={i18n.t("promptModal.form.temperature")}
                    name="temperature"
                    error={touched.temperature && Boolean(errors.temperature)}
                    helperText={touched.temperature && errors.temperature}
                    variant="outlined"
                    margin="dense"
                    fullWidth
                    type="number"
                    inputProps={{
                      step: "0.1",
                      min: "0",
                      max: "1",
                    }}
                  />
                  <Field
                    as={TextField}
                    label={i18n.t("promptModal.form.max_tokens")}
                    name="maxTokens"
                    error={touched.maxTokens && Boolean(errors.maxTokens)}
                    helperText={touched.maxTokens && errors.maxTokens}
                    variant="outlined"
                    margin="dense"
                    fullWidth
                    type="number"
                  />
                  <Field
                    as={TextField}
                    label={i18n.t("promptModal.form.max_messages")}
                    name="maxMessages"
                    error={touched.maxMessages && Boolean(errors.maxMessages)}
                    helperText={touched.maxMessages && errors.maxMessages}
                    variant="outlined"
                    margin="dense"
                    fullWidth
                    type="number"
                  />
                </div>
              </DialogContent>
              <DialogActions>
                <Button
                  onClick={handleClose}
                  color="secondary"
                  disabled={isSubmitting}
                  variant="outlined"
                >
                  {i18n.t("promptModal.buttons.cancel")}
                </Button>
                <Button
                  type="submit"
                  color="primary"
                  disabled={isSubmitting}
                  variant="contained"
                  className={classes.btnWrapper}
                >
                  {promptId ? i18n.t("promptModal.buttons.okEdit") : i18n.t("promptModal.buttons.okAdd")}
                  {isSubmitting && (
                    <CircularProgress size={24} className={classes.buttonProgress} />
                  )}
                </Button>
              </DialogActions>
            </Form>
          )}
        </Formik>
      </Dialog>
    </div>
  );
};

export default PromptModal;