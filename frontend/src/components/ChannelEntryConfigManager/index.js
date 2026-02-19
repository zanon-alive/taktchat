import React, { useState, useEffect } from "react";
import {
  Paper,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Typography,
  FormHelperText,
  CircularProgress,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import { toast } from "react-toastify";
import { i18n } from "../../translate/i18n";
import useChannelEntryConfigs from "../../hooks/useChannelEntryConfigs";
import useQueues from "../../hooks/useQueues";
import useTags from "../../hooks/useTags";
import useWhatsApps from "../../hooks/useWhatsApps";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
  },
  paper: {
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  sectionTitle: {
    marginBottom: theme.spacing(2),
    fontWeight: 600,
  },
  field: {
    marginBottom: theme.spacing(2),
  },
  fullWidth: {
    width: "100%",
  },
  buttonContainer: {
    marginTop: theme.spacing(2),
  },
}));

const ENTRY_SOURCES = [
  { value: "lead", labelKey: "channelEntryConfig.lead" },
  { value: "revendedor", labelKey: "channelEntryConfig.revendedor" },
  { value: "site_chat", labelKey: "channelEntryConfig.siteChat" },
];

const ChannelEntryConfigManager = () => {
  const classes = useStyles();
  const { list, update } = useChannelEntryConfigs();
  const { findAll: findAllQueues } = useQueues();
  const { tags, loading: tagsLoading } = useTags();
  const { whatsApps, loading: whatsAppsLoading } = useWhatsApps();

  const [queues, setQueues] = useState([]);
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState({});

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [configList, queueList] = await Promise.all([list(), findAllQueues()]);
        setConfigs(Array.isArray(configList) ? configList : []);
        setQueues(Array.isArray(queueList) ? queueList : []);
      } catch (err) {
        toast.error(err?.response?.data?.message || i18n.t("channelEntryConfig.loadError"));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const getConfigBySource = (entrySource) => {
    return configs.find((c) => c.entrySource === entrySource) || {
      entrySource,
      defaultQueueId: null,
      defaultTagId: null,
      whatsappId: null,
      welcomeMessage: "",
    };
  };

  const handleSave = async (entrySource, form) => {
    setSaving((prev) => ({ ...prev, [entrySource]: true }));
    try {
      await update({
        entrySource,
        defaultQueueId: form.defaultQueueId || null,
        defaultTagId: form.defaultTagId || null,
        whatsappId: form.whatsappId || null,
        welcomeMessage: form.welcomeMessage?.trim() || null,
      });
      toast.success(i18n.t("channelEntryConfig.saveSuccess"));
      const configList = await list();
      setConfigs(Array.isArray(configList) ? configList : []);
    } catch (err) {
      toast.error(err?.response?.data?.message || i18n.t("channelEntryConfig.saveError"));
    } finally {
      setSaving((prev) => ({ ...prev, [entrySource]: false }));
    }
  };

  if (loading) {
    return (
      <Paper className={classes.paper}>
        <Grid container justifyContent="center" alignItems="center" style={{ minHeight: 120 }}>
          <CircularProgress />
        </Grid>
      </Paper>
    );
  }

  return (
    <div className={classes.root}>
      {ENTRY_SOURCES.map(({ value: entrySource, labelKey }) => (
        <ChannelEntryConfigForm
          key={entrySource}
          entrySource={entrySource}
          label={i18n.t(labelKey)}
          config={getConfigBySource(entrySource)}
          queues={queues}
          tags={tags || []}
          whatsApps={whatsApps || []}
          onSave={handleSave}
          saving={saving[entrySource]}
          classes={classes}
        />
      ))}
    </div>
  );
};

function ChannelEntryConfigForm({ entrySource, label, config, queues, tags, whatsApps, onSave, saving, classes }) {
  const [defaultQueueId, setDefaultQueueId] = useState(config.defaultQueueId ?? "");
  const [defaultTagId, setDefaultTagId] = useState(config.defaultTagId ?? "");
  const [whatsappId, setWhatsappId] = useState(config.whatsappId ?? "");
  const [welcomeMessage, setWelcomeMessage] = useState(config.welcomeMessage ?? "");

  useEffect(() => {
    setDefaultQueueId(config.defaultQueueId ?? "");
    setDefaultTagId(config.defaultTagId ?? "");
    setWhatsappId(config.whatsappId ?? "");
    setWelcomeMessage(config.welcomeMessage ?? "");
  }, [config.defaultQueueId, config.defaultTagId, config.whatsappId, config.welcomeMessage]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(entrySource, {
      defaultQueueId: defaultQueueId || null,
      defaultTagId: defaultTagId || null,
      whatsappId: whatsappId || null,
      welcomeMessage: welcomeMessage || null,
    });
  };

  return (
    <Paper className={classes.paper} elevation={1}>
      <Typography variant="h6" className={classes.sectionTitle}>
        {label}
      </Typography>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth variant="outlined" size="small" className={classes.field}>
              <InputLabel id={`queue-${entrySource}`}>{i18n.t("channelEntryConfig.defaultQueue")}</InputLabel>
              <Select
                labelId={`queue-${entrySource}`}
                value={defaultQueueId != null && queues.some((q) => q.id === defaultQueueId) ? defaultQueueId : ""}
                onChange={(e) => setDefaultQueueId(e.target.value)}
                label={i18n.t("channelEntryConfig.defaultQueue")}
              >
                <MenuItem value="">{i18n.t("channelEntryConfig.none")}</MenuItem>
                {queues.map((q) => (
                  <MenuItem key={q.id} value={q.id}>
                    {q.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth variant="outlined" size="small" className={classes.field}>
              <InputLabel id={`tag-${entrySource}`}>{i18n.t("channelEntryConfig.defaultTag")}</InputLabel>
              <Select
                labelId={`tag-${entrySource}`}
                value={defaultTagId != null && tags.some((t) => t.id === defaultTagId) ? defaultTagId : ""}
                onChange={(e) => setDefaultTagId(e.target.value)}
                label={i18n.t("channelEntryConfig.defaultTag")}
              >
                <MenuItem value="">{i18n.t("channelEntryConfig.none")}</MenuItem>
                {tags.map((t) => (
                  <MenuItem key={t.id} value={t.id}>
                    {t.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth variant="outlined" size="small" className={classes.field}>
              <InputLabel id={`whatsapp-${entrySource}`}>{i18n.t("channelEntryConfig.whatsapp")}</InputLabel>
              <Select
                labelId={`whatsapp-${entrySource}`}
                value={whatsappId != null && whatsApps.some((w) => w.id === whatsappId) ? whatsappId : ""}
                onChange={(e) => setWhatsappId(e.target.value)}
                label={i18n.t("channelEntryConfig.whatsapp")}
              >
                <MenuItem value="">{i18n.t("channelEntryConfig.none")}</MenuItem>
                {whatsApps.map((w) => (
                  <MenuItem key={w.id} value={w.id}>
                    {w.name || w.id}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              minRows={3}
              variant="outlined"
              size="small"
              label={i18n.t("channelEntryConfig.welcomeMessage")}
              value={welcomeMessage}
              onChange={(e) => setWelcomeMessage(e.target.value)}
              placeholder={i18n.t("channelEntryConfig.welcomeMessagePlaceholder")}
              className={classes.field}
            />
            <FormHelperText>{i18n.t("channelEntryConfig.welcomeMessageHelp")}</FormHelperText>
          </Grid>
          <Grid item xs={12} className={classes.buttonContainer}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={saving}
              startIcon={saving ? <CircularProgress size={16} color="inherit" /> : null}
            >
              {saving ? i18n.t("channelEntryConfig.saving") : i18n.t("channelEntryConfig.save")}
            </Button>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
}

export default ChannelEntryConfigManager;
