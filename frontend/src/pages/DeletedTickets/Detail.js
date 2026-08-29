import React, { useContext, useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import { Alert, Box, Button, Link, Paper, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { format, parseISO } from "date-fns";
import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";
import ModalImageCors from "../../components/ModalImageCors";
import AudioModal from "../../components/AudioModal";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import { i18n } from "../../translate/i18n";
import { AuthContext } from "../../context/Auth/AuthContext";
import usePermissions from "../../hooks/usePermissions";

const useStyles = makeStyles((theme) => ({
  paper: {
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  bubble: {
    maxWidth: "70%",
    padding: theme.spacing(1, 1.5),
    borderRadius: 8,
    marginBottom: theme.spacing(1),
  },
  fromMe: {
    marginLeft: "auto",
    backgroundColor: theme.palette.mode === "dark" ? "#056162" : "#d9fdd3",
  },
  fromThem: {
    marginRight: "auto",
    backgroundColor: theme.palette.action.hover,
  },
}));

const renderMedia = (msg) => {
  if (!msg.mediaUrl) return null;
  if (msg.mediaType === "image" || msg.mediaType === "sticker") {
    return <ModalImageCors imageUrl={msg.mediaUrl} />;
  }
  if (msg.mediaType === "audio" || msg.mediaType === "ptt") {
    return <AudioModal url={msg.mediaUrl} fromMe={msg.fromMe} />;
  }
  return (
    <Link href={msg.mediaUrl} target="_blank" rel="noopener noreferrer">
      {i18n.t("deletedTickets.downloadMedia")}
    </Link>
  );
};

const DeletedTicketDetail = () => {
  const classes = useStyles();
  const history = useHistory();
  const { ticketId } = useParams();
  const { user } = useContext(AuthContext);
  const { hasPermission } = usePermissions();
  const [ticket, setTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [notes, setNotes] = useState([]);
  const [logs, setLogs] = useState([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const canView =
    user?.profile === "admin" ||
    user?.profile === "super" ||
    user?.super ||
    hasPermission("tickets.viewDeleted");

  useEffect(() => {
    if (!canView) {
      history.push("/tickets");
    }
  }, [canView, history]);

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      try {
        const { data: payload } = await api.get(`/tickets/deleted/${ticketId}`, {
          params: { pageNumber, limit: 50 },
        });
        if (ignore) return;
        setTicket(payload.ticket);
        setNotes(payload.notes || []);
        setLogs(payload.logs || []);
        setHasMore(Boolean(payload.hasMore));
        setMessages((prev) =>
          pageNumber === 1 ? payload.messages || [] : [...prev, ...(payload.messages || [])]
        );
      } catch (err) {
        toastError(err);
        history.push("/tickets-excluidos");
      }
    };
    load();
    return () => {
      ignore = true;
    };
  }, [ticketId, history, pageNumber]);

  if (!canView || !ticket) return null;

  return (
    <MainContainer>
      <MainHeader>
        <Title>
          {i18n.t("deletedTickets.detailTitle")} #{ticket.id}
        </Title>
        <Button onClick={() => history.push("/tickets-excluidos")}>
          {i18n.t("deletedTickets.back")}
        </Button>
      </MainHeader>
      <Alert severity="warning" style={{ marginBottom: 16 }}>
        {i18n.t("deletedTickets.banner")}
      </Alert>
      {ticket.anonymizedAt && (
        <Alert severity="error" style={{ marginBottom: 16 }}>
          {i18n.t("deletedTickets.lgpdBanner")}
        </Alert>
      )}
      <Paper className={classes.paper} variant="outlined">
        <Typography>
          <strong>{i18n.t("deletedTickets.contact")}:</strong> {ticket.contact?.name} (
          {ticket.contact?.number})
        </Typography>
        <Typography>
          <strong>{i18n.t("deletedTickets.deletedBy")}:</strong>{" "}
          {ticket.deletedByName || i18n.t("deletedTickets.removedUser")}
        </Typography>
        <Typography>
          <strong>{i18n.t("deletedTickets.when")}:</strong>{" "}
          {ticket.deletedAt ? format(parseISO(ticket.deletedAt), "dd/MM/yyyy HH:mm") : "—"}
        </Typography>
        <Typography>
          <strong>{i18n.t("deletedTickets.category")}:</strong>{" "}
          {ticket.deletionReasonCategory
            ? i18n.t(`hideTicketModal.categories.${ticket.deletionReasonCategory}`)
            : "—"}
        </Typography>
        <Typography>
          <strong>{i18n.t("deletedTickets.reason")}:</strong> {ticket.deletionReason}
        </Typography>
        <Typography>
          <strong>{i18n.t("deletedTickets.status")}:</strong> {ticket.status}
        </Typography>
      </Paper>
      <Paper className={classes.paper} variant="outlined">
        <Typography variant="subtitle1" gutterBottom>
          {i18n.t("deletedTickets.conversation")}
        </Typography>
        <Box display="flex" flexDirection="column">
          {messages.map((msg) => (
            <Box
              key={msg.id}
              className={`${classes.bubble} ${msg.fromMe ? classes.fromMe : classes.fromThem}`}
            >
              <Typography variant="caption" display="block">
                {msg.createdAt ? format(parseISO(msg.createdAt), "dd/MM HH:mm") : ""}
                {msg.isPrivate ? ` · ${i18n.t("deletedTickets.private")}` : ""}
              </Typography>
              {renderMedia(msg)}
              {msg.body && (
                <Typography variant="body2" style={{ marginTop: 4 }}>
                  {msg.body}
                </Typography>
              )}
            </Box>
          ))}
          {messages.length === 0 && (
            <Typography color="textSecondary">{i18n.t("deletedTickets.noMessages")}</Typography>
          )}
        </Box>
        {hasMore && (
          <Box mt={2}>
            <Button onClick={() => setPageNumber((p) => p + 1)}>
              {i18n.t("deletedTickets.loadMore")}
            </Button>
          </Box>
        )}
      </Paper>
      <Paper className={classes.paper} variant="outlined">
        <Typography variant="subtitle1" gutterBottom>
          {i18n.t("deletedTickets.notes")}
        </Typography>
        {notes.length === 0 ? (
          <Typography color="textSecondary">{i18n.t("deletedTickets.noNotes")}</Typography>
        ) : (
          notes.map((note) => (
            <Typography key={note.id} variant="body2" paragraph>
              <strong>{note.user?.name || "—"}:</strong> {note.note}
            </Typography>
          ))
        )}
      </Paper>
      <Paper className={classes.paper} variant="outlined">
        <Typography variant="subtitle1" gutterBottom>
          {i18n.t("deletedTickets.logs")}
        </Typography>
        {logs.length === 0 ? (
          <Typography color="textSecondary">{i18n.t("deletedTickets.noLogs")}</Typography>
        ) : (
          logs.map((log) => (
            <Typography key={log.id} variant="body2">
              {log.createdAt ? format(parseISO(log.createdAt), "dd/MM/yyyy HH:mm") : ""} —{" "}
              {log.type} ({log.user?.name || "—"})
            </Typography>
          ))
        )}
      </Paper>
    </MainContainer>
  );
};

export default DeletedTicketDetail;
