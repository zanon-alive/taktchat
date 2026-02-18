import React, { useState, useEffect, useContext } from "react";
import {
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Divider,
  InputAdornment,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import { toast } from "react-toastify";
import { i18n } from "../../translate/i18n";
import { ContentCopy, Check, Refresh } from "@mui/icons-material";
import { getBackendUrl } from "../../config";
import { AuthContext } from "../../context/Auth/AuthContext";
import api from "../../services/api";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
  },
  paper: {
    padding: theme.spacing(3),
    marginBottom: theme.spacing(2),
  },
  sectionTitle: {
    marginBottom: theme.spacing(2),
    fontWeight: 600,
  },
  codeBlock: {
    backgroundColor: "#f5f5f5",
    padding: theme.spacing(2),
    borderRadius: theme.shape.borderRadius,
    fontFamily: "monospace",
    fontSize: "14px",
    whiteSpace: "pre-wrap",
    wordBreak: "break-all",
    position: "relative",
    border: "1px solid #e0e0e0",
  },
  copyButton: {
    position: "absolute",
    top: theme.spacing(1),
    right: theme.spacing(1),
  },
  field: {
    marginBottom: theme.spacing(2),
  },
  fullWidth: {
    width: "100%",
  },
  instructions: {
    marginTop: theme.spacing(2),
    padding: theme.spacing(2),
    backgroundColor: "#f9f9f9",
    borderRadius: theme.shape.borderRadius,
  },
  instructionItem: {
    marginBottom: theme.spacing(1),
  },
}));

const SiteChatWidgetManager = () => {
  const classes = useStyles();
  const { user } = useContext(AuthContext);
  const [companyId, setCompanyId] = useState("");
  const [companyToken, setCompanyToken] = useState("");
  const [useToken, setUseToken] = useState(false);
  const [widgetUrl, setWidgetUrl] = useState("");
  const [apiUrl, setApiUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [embedCode, setEmbedCode] = useState("");
  const [loadingToken, setLoadingToken] = useState(false);

  const fetchSiteChatToken = async () => {
    setLoadingToken(true);
    try {
      const { data } = await api.get("/companies/site-chat-token");
      setCompanyToken(data.siteChatToken);
      setUseToken(true);
      toast.success(i18n.t("siteChatWidget.tokenFetched"));
    } catch (err) {
      toast.error(err?.response?.data?.message || i18n.t("siteChatWidget.tokenError"));
    } finally {
      setLoadingToken(false);
    }
  };

  useEffect(() => {
    // Detectar URL da API e do widget
    const backendUrl = getBackendUrl();
    setApiUrl(backendUrl);
    
    // Widget URL: assumindo que será servido do mesmo domínio do frontend
    // Em produção, pode ser configurado via env
    const frontendUrl = window.location.origin;
    setWidgetUrl(`${frontendUrl}/widget.js`);

    // Preencher companyId automaticamente se disponível
    if (user?.companyId) {
      setCompanyId(String(user.companyId));
    }
  }, [user]);

  useEffect(() => {
    generateEmbedCode();
  }, [companyId, companyToken, useToken, widgetUrl, apiUrl]);

  const generateEmbedCode = () => {
    if (!widgetUrl) return "";

    const apiUrlAttr = apiUrl ? ` data-api-url="${apiUrl}"` : "";
    let code = "";

    if (useToken && companyToken) {
      code = `<script src="${widgetUrl}" data-company-token="${companyToken}"${apiUrlAttr}></script>`;
    } else if (!useToken && companyId) {
      code = `<script src="${widgetUrl}" data-company-id="${companyId}"${apiUrlAttr}></script>`;
    } else {
      code = `<!-- Configure companyId ou companyToken -->\n<script src="${widgetUrl}" data-company-id="SEU_COMPANY_ID"${apiUrlAttr}></script>`;
    }

    setEmbedCode(code);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(embedCode).then(() => {
      setCopied(true);
      toast.success(i18n.t("siteChatWidget.copied"));
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className={classes.root}>
      <Paper className={classes.paper} elevation={1}>
        <Typography variant="h6" className={classes.sectionTitle}>
          {i18n.t("siteChatWidget.title")}
        </Typography>
        
        <Alert severity="info" style={{ marginBottom: 16 }}>
          {i18n.t("siteChatWidget.info")}
        </Alert>

        <FormControl className={classes.fullWidth} style={{ marginBottom: 16 }}>
          <InputLabel>{i18n.t("siteChatWidget.authMethod")}</InputLabel>
          <Select
            value={useToken ? "token" : "id"}
            onChange={(e) => setUseToken(e.target.value === "token")}
          >
            <MenuItem value="id">{i18n.t("siteChatWidget.useCompanyId")}</MenuItem>
            <MenuItem value="token">{i18n.t("siteChatWidget.useCompanyToken")}</MenuItem>
          </Select>
          <FormHelperText>{i18n.t("siteChatWidget.authMethodHelp")}</FormHelperText>
        </FormControl>

        {!useToken ? (
          <TextField
            className={classes.fullWidth}
            label={i18n.t("siteChatWidget.companyId")}
            value={companyId}
            onChange={(e) => setCompanyId(e.target.value)}
            helperText={i18n.t("siteChatWidget.companyIdHelp")}
            margin="normal"
          />
        ) : (
          <TextField
            className={classes.fullWidth}
            label={i18n.t("siteChatWidget.companyToken")}
            value={companyToken}
            onChange={(e) => setCompanyToken(e.target.value)}
            helperText={i18n.t("siteChatWidget.companyTokenHelp")}
            margin="normal"
            type="password"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Button
                    size="small"
                    startIcon={loadingToken ? null : <Refresh />}
                    onClick={fetchSiteChatToken}
                    disabled={loadingToken}
                  >
                    {loadingToken ? i18n.t("siteChatWidget.loadingToken") : i18n.t("siteChatWidget.getToken")}
                  </Button>
                </InputAdornment>
              ),
            }}
          />
        )}

        <Divider style={{ margin: "24px 0" }} />

        <Typography variant="subtitle1" className={classes.sectionTitle}>
          {i18n.t("siteChatWidget.embedCode")}
        </Typography>

        <Box position="relative">
          <div className={classes.codeBlock}>
            {embedCode || i18n.t("siteChatWidget.configureFirst")}
          </div>
          {embedCode && (
            <Button
              className={classes.copyButton}
              size="small"
              startIcon={copied ? <Check /> : <ContentCopy />}
              onClick={handleCopy}
              variant="outlined"
            >
              {copied ? i18n.t("siteChatWidget.copied") : i18n.t("siteChatWidget.copy")}
            </Button>
          )}
        </Box>

        <div className={classes.instructions}>
          <Typography variant="subtitle2" style={{ marginBottom: 8, fontWeight: 600 }}>
            {i18n.t("siteChatWidget.instructions.title")}
          </Typography>
          <ol>
            <li className={classes.instructionItem}>
              {i18n.t("siteChatWidget.instructions.step1")}
            </li>
            <li className={classes.instructionItem}>
              {i18n.t("siteChatWidget.instructions.step2")}
            </li>
            <li className={classes.instructionItem}>
              {i18n.t("siteChatWidget.instructions.step3")}
            </li>
            <li className={classes.instructionItem}>
              {i18n.t("siteChatWidget.instructions.step4")}
            </li>
          </ol>
        </div>

        <Alert severity="warning" style={{ marginTop: 16 }}>
          <Typography variant="body2">
            <strong>{i18n.t("siteChatWidget.important")}</strong>
          </Typography>
          <Typography variant="body2" style={{ marginTop: 8 }}>
            {i18n.t("siteChatWidget.importantNote")}
          </Typography>
        </Alert>

        <Box mt={2}>
          <Typography variant="caption" color="textSecondary">
            {i18n.t("siteChatWidget.apiUrl")}: <code>{apiUrl}</code>
          </Typography>
          <br />
          <Typography variant="caption" color="textSecondary">
            {i18n.t("siteChatWidget.widgetUrl")}: <code>{widgetUrl}</code>
          </Typography>
        </Box>
      </Paper>
    </div>
  );
};

export default SiteChatWidgetManager;
