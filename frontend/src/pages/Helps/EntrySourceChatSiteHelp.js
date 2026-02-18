import React, { useState } from "react";
import {
  Paper,
  Typography,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Divider,
} from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  FilterList as FilterIcon,
  Settings as SettingsIcon,
  ContactMail as LeadIcon,
  Chat as ChatIcon,
  Code as CodeIcon,
} from "@mui/icons-material";
import makeStyles from "@mui/styles/makeStyles";
import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";
import { i18n } from "../../translate/i18n";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
  },
  content: {
    flex: 1,
    overflow: "auto",
    padding: theme.spacing(3),
    backgroundColor: theme.palette.background.default,
  },
  sectionCard: {
    marginBottom: theme.spacing(2),
    border: `1px solid ${theme.palette.divider}`,
  },
  stepNumber: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    width: 28,
    height: 28,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold",
    fontSize: "0.875rem",
    marginRight: theme.spacing(2),
  },
  infoBox: {
    backgroundColor: theme.palette.info.light,
    color: theme.palette.info.contrastText,
    padding: theme.spacing(2),
    borderRadius: theme.shape.borderRadius,
    marginBottom: theme.spacing(2),
  },
  codeBlock: {
    backgroundColor: theme.palette.grey[900],
    color: theme.palette.common.white,
    padding: theme.spacing(2),
    borderRadius: theme.shape.borderRadius,
    fontFamily: "monospace",
    fontSize: "0.8rem",
    overflow: "auto",
    margin: theme.spacing(1, 0),
  },
  chip: {
    margin: theme.spacing(0.5),
  },
}));

const EntrySourceChatSiteHelp = () => {
  const classes = useStyles();
  const [expanded, setExpanded] = useState("entrysource");

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <div className={classes.root}>
      <MainHeader>
        <Title>{i18n.t("helps.entrySourceChatSite.title")}</Title>
      </MainHeader>
      <Box className={classes.content}>
        <Typography variant="body1" paragraph>
          {i18n.t("helps.entrySourceChatSite.intro")}
        </Typography>

        <Accordion expanded={expanded === "entrysource"} onChange={handleChange("entrysource")} className={classes.sectionCard}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <FilterIcon style={{ marginRight: 8 }} />
            <Typography variant="subtitle1" fontWeight={600}>
              {i18n.t("helps.entrySourceChatSite.entrySourceTitle")}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" paragraph>
              {i18n.t("helps.entrySourceChatSite.entrySourceDesc")}
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={0.5} mb={2}>
              <Chip label="whatsapp" size="small" className={classes.chip} />
              <Chip label="lead" size="small" className={classes.chip} />
              <Chip label="revendedor" size="small" className={classes.chip} />
              <Chip label="site_chat" size="small" className={classes.chip} />
              <Chip label="channel" size="small" className={classes.chip} />
            </Box>
            <Typography variant="body2">
              {i18n.t("helps.entrySourceChatSite.entrySourceFilter")}
            </Typography>
          </AccordionDetails>
        </Accordion>

        <Accordion expanded={expanded === "channels"} onChange={handleChange("channels")} className={classes.sectionCard}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <SettingsIcon style={{ marginRight: 8 }} />
            <Typography variant="subtitle1" fontWeight={600}>
              {i18n.t("helps.entrySourceChatSite.channelsTitle")}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" paragraph>
              {i18n.t("helps.entrySourceChatSite.channelsDesc")}
            </Typography>
            <List dense>
              <ListItem>
                <ListItemIcon style={{ minWidth: 36 }}>
                  <Box className={classes.stepNumber}>1</Box>
                </ListItemIcon>
                <ListItemText primary={i18n.t("helps.entrySourceChatSite.channelsStep1")} />
              </ListItem>
              <ListItem>
                <ListItemIcon style={{ minWidth: 36 }}>
                  <Box className={classes.stepNumber}>2</Box>
                </ListItemIcon>
                <ListItemText primary={i18n.t("helps.entrySourceChatSite.channelsStep2")} />
              </ListItem>
              <ListItem>
                <ListItemIcon style={{ minWidth: 36 }}>
                  <Box className={classes.stepNumber}>3</Box>
                </ListItemIcon>
                <ListItemText primary={i18n.t("helps.entrySourceChatSite.channelsStep3")} />
              </ListItem>
            </List>
          </AccordionDetails>
        </Accordion>

        <Accordion expanded={expanded === "lead"} onChange={handleChange("lead")} className={classes.sectionCard}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <LeadIcon style={{ marginRight: 8 }} />
            <Typography variant="subtitle1" fontWeight={600}>
              {i18n.t("helps.entrySourceChatSite.leadTitle")}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" paragraph>
              {i18n.t("helps.entrySourceChatSite.leadDesc")}
            </Typography>
          </AccordionDetails>
        </Accordion>

        <Accordion expanded={expanded === "chat"} onChange={handleChange("chat")} className={classes.sectionCard}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <ChatIcon style={{ marginRight: 8 }} />
            <Typography variant="subtitle1" fontWeight={600}>
              {i18n.t("helps.entrySourceChatSite.chatTitle")}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" paragraph>
              {i18n.t("helps.entrySourceChatSite.chatDesc")}
            </Typography>
            <Paper variant="outlined" className={classes.infoBox}>
              <Typography variant="body2">
                {i18n.t("helps.entrySourceChatSite.chatConfig")}
              </Typography>
            </Paper>
          </AccordionDetails>
        </Accordion>

        <Accordion expanded={expanded === "widget"} onChange={handleChange("widget")} className={classes.sectionCard}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <CodeIcon style={{ marginRight: 8 }} />
            <Typography variant="subtitle1" fontWeight={600}>
              {i18n.t("helps.entrySourceChatSite.widgetTitle")}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" paragraph>
              {i18n.t("helps.entrySourceChatSite.widgetDesc")}
            </Typography>
            <Typography variant="caption" display="block" gutterBottom>
              {i18n.t("helps.entrySourceChatSite.widgetToken")}
            </Typography>
          </AccordionDetails>
        </Accordion>

        <Divider style={{ margin: "24px 0" }} />
        <Typography variant="caption" color="textSecondary">
          {i18n.t("helps.entrySourceChatSite.docsRef")}
        </Typography>
      </Box>
    </div>
  );
};

export default EntrySourceChatSiteHelp;
