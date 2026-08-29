import React, { useContext, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import { format, parseISO } from "date-fns";
import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import { i18n } from "../../translate/i18n";
import { AuthContext } from "../../context/Auth/AuthContext";

const CATEGORIES = [
  "duplicado",
  "teste",
  "erro_abertura",
  "contato_pediu",
  "lgpd",
  "outro",
];

const useStyles = makeStyles((theme) => ({
  mainPaper: {
    flex: 1,
    padding: theme.spacing(2),
    overflowY: "auto",
  },
  filters: {
    display: "flex",
    flexWrap: "wrap",
    gap: theme.spacing(1.5),
    marginBottom: theme.spacing(2),
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  empty: {
    padding: theme.spacing(4),
    textAlign: "center",
    color: theme.palette.text.secondary,
  },
}));

const DeletedTickets = () => {
  const classes = useStyles();
  const history = useHistory();
  const { user } = useContext(AuthContext);
  const [tickets, setTickets] = useState([]);
  const [count, setCount] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");
  const [category, setCategory] = useState("");
  const [searchParam, setSearchParam] = useState("");

  const isAdmin = user?.profile === "admin" || user?.profile === "super" || user?.super;

  useEffect(() => {
    if (!isAdmin) {
      history.push("/tickets");
    }
  }, [isAdmin, history]);

  useEffect(() => {
    let ignore = false;
    const fetchTickets = async () => {
      try {
        const { data } = await api.get("/tickets/deleted", {
          params: {
            pageNumber,
            dateStart: dateStart || undefined,
            dateEnd: dateEnd || undefined,
            category: category || undefined,
            searchParam: searchParam || undefined,
          },
        });
        if (ignore) return;
        setTickets(data.tickets || []);
        setCount(data.count || 0);
        setHasMore(Boolean(data.hasMore));
      } catch (err) {
        toastError(err);
      }
    };
    fetchTickets();
    return () => {
      ignore = true;
    };
  }, [pageNumber, dateStart, dateEnd, category, searchParam]);

  if (!isAdmin) return null;

  return (
    <MainContainer>
      <MainHeader>
        <Title>{i18n.t("deletedTickets.title")} ({count})</Title>
      </MainHeader>
      <Paper className={classes.mainPaper} variant="outlined">
        <Box className={classes.filters}>
          <TextField
            size="small"
            type="date"
            label={i18n.t("deletedTickets.dateStart")}
            InputLabelProps={{ shrink: true }}
            value={dateStart}
            onChange={(e) => {
              setPageNumber(1);
              setDateStart(e.target.value);
            }}
          />
          <TextField
            size="small"
            type="date"
            label={i18n.t("deletedTickets.dateEnd")}
            InputLabelProps={{ shrink: true }}
            value={dateEnd}
            onChange={(e) => {
              setPageNumber(1);
              setDateEnd(e.target.value);
            }}
          />
          <FormControl size="small" style={{ minWidth: 180 }}>
            <InputLabel>{i18n.t("deletedTickets.category")}</InputLabel>
            <Select
              label={i18n.t("deletedTickets.category")}
              value={category}
              onChange={(e) => {
                setPageNumber(1);
                setCategory(e.target.value);
              }}
            >
              <MenuItem value="">{i18n.t("deletedTickets.allCategories")}</MenuItem>
              {CATEGORIES.map((slug) => (
                <MenuItem key={slug} value={slug}>
                  {i18n.t(`hideTicketModal.categories.${slug}`)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            size="small"
            label={i18n.t("deletedTickets.search")}
            value={searchParam}
            onChange={(e) => {
              setPageNumber(1);
              setSearchParam(e.target.value);
            }}
          />
        </Box>
        {tickets.length === 0 ? (
          <Typography className={classes.empty}>{i18n.t("deletedTickets.empty")}</Typography>
        ) : (
          <table className={classes.table}>
            <thead>
              <tr>
                <th>#</th>
                <th>{i18n.t("deletedTickets.contact")}</th>
                <th>{i18n.t("deletedTickets.queue")}</th>
                <th>{i18n.t("deletedTickets.status")}</th>
                <th>{i18n.t("deletedTickets.deletedBy")}</th>
                <th>{i18n.t("deletedTickets.when")}</th>
                <th>{i18n.t("deletedTickets.category")}</th>
                <th>{i18n.t("deletedTickets.reason")}</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {tickets.map((ticket) => (
                <tr key={ticket.id}>
                  <td>{ticket.id}</td>
                  <td>{ticket.contact?.name || ticket.contact?.number}</td>
                  <td>{ticket.queue?.name || ticket.whatsapp?.name || "—"}</td>
                  <td>{ticket.status}</td>
                  <td>{ticket.deletedByName || i18n.t("deletedTickets.removedUser")}</td>
                  <td>
                    {ticket.deletedAt
                      ? format(parseISO(ticket.deletedAt), "dd/MM/yyyy HH:mm")
                      : "—"}
                  </td>
                  <td>
                    {ticket.deletionReasonCategory
                      ? i18n.t(`hideTicketModal.categories.${ticket.deletionReasonCategory}`)
                      : "—"}
                  </td>
                  <td>{ticket.deletionReason}</td>
                  <td>
                    <Button
                      size="small"
                      onClick={() => history.push(`/tickets-excluidos/${ticket.id}`)}
                    >
                      {i18n.t("deletedTickets.view")}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <Box display="flex" justifyContent="flex-end" mt={2} gap={1}>
          <Button disabled={pageNumber <= 1} onClick={() => setPageNumber((p) => p - 1)}>
            {i18n.t("deletedTickets.prev")}
          </Button>
          <Button disabled={!hasMore} onClick={() => setPageNumber((p) => p + 1)}>
            {i18n.t("deletedTickets.next")}
          </Button>
        </Box>
      </Paper>
    </MainContainer>
  );
};

export default DeletedTickets;
