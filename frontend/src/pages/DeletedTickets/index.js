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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import GetAppIcon from "@mui/icons-material/GetApp";
import { makeStyles } from "@mui/styles";
import { format, parseISO } from "date-fns";
import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import { i18n } from "../../translate/i18n";
import { AuthContext } from "../../context/Auth/AuthContext";
import useDebounce from "../../hooks/useDebounce";
import usePermissions from "../../hooks/usePermissions";

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
    alignItems: "center",
  },
  stickyHead: {
    "& th": {
      position: "sticky",
      top: 0,
      backgroundColor: theme.palette.background.paper,
      zIndex: 1,
      fontWeight: 600,
    },
  },
  reasonCell: {
    maxWidth: 240,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
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
  const { hasPermission } = usePermissions();
  const [tickets, setTickets] = useState([]);
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [count, setCount] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");
  const [category, setCategory] = useState("");
  const [deletedBy, setDeletedBy] = useState("");
  const [searchParam, setSearchParam] = useState("");
  const debouncedSearch = useDebounce(searchParam, 450);

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
    const loadMeta = async () => {
      try {
        const [{ data: meta }, { data: userList }] = await Promise.all([
          api.get("/tickets/deletion-meta"),
          api.get("/users/list"),
        ]);
        if (ignore) return;
        setCategories(meta.categories || []);
        setUsers(Array.isArray(userList) ? userList : userList?.users || []);
      } catch (err) {
        if (!ignore) toastError(err);
      }
    };
    loadMeta();
    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    if (!canView) return undefined;
    let ignore = false;
    const fetchTickets = async () => {
      try {
        const { data } = await api.get("/tickets/deleted", {
          params: {
            pageNumber,
            dateStart: dateStart || undefined,
            dateEnd: dateEnd || undefined,
            category: category || undefined,
            deletedBy: deletedBy || undefined,
            searchParam: debouncedSearch || undefined,
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
  }, [pageNumber, dateStart, dateEnd, category, deletedBy, debouncedSearch, canView]);

  const handleExport = async () => {
    try {
      const response = await api.get("/tickets/deleted/export", {
        params: {
          dateStart: dateStart || undefined,
          dateEnd: dateEnd || undefined,
          category: category || undefined,
          deletedBy: deletedBy || undefined,
          searchParam: debouncedSearch || undefined,
        },
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `tickets-ocultos-${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      toastError(err);
    }
  };

  if (!canView) return null;

  return (
    <MainContainer>
      <MainHeader>
        <Title>
          {i18n.t("deletedTickets.title")} ({count})
        </Title>
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
              {categories.map((slug) => (
                <MenuItem key={slug} value={slug}>
                  {i18n.t(`hideTicketModal.categories.${slug}`)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" style={{ minWidth: 200 }}>
            <InputLabel>{i18n.t("deletedTickets.deletedBy")}</InputLabel>
            <Select
              label={i18n.t("deletedTickets.deletedBy")}
              value={deletedBy}
              onChange={(e) => {
                setPageNumber(1);
                setDeletedBy(e.target.value);
              }}
            >
              <MenuItem value="">{i18n.t("deletedTickets.allUsers")}</MenuItem>
              {users.map((u) => (
                <MenuItem key={u.id} value={u.id}>
                  {u.name}
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
          <Button
            variant="outlined"
            startIcon={<GetAppIcon />}
            onClick={handleExport}
          >
            {i18n.t("deletedTickets.exportCsv")}
          </Button>
        </Box>
        {tickets.length === 0 ? (
          <Typography className={classes.empty}>{i18n.t("deletedTickets.empty")}</Typography>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead className={classes.stickyHead}>
                <TableRow>
                  <TableCell>#</TableCell>
                  <TableCell>{i18n.t("deletedTickets.contact")}</TableCell>
                  <TableCell>{i18n.t("deletedTickets.queue")}</TableCell>
                  <TableCell>{i18n.t("deletedTickets.status")}</TableCell>
                  <TableCell>{i18n.t("deletedTickets.deletedBy")}</TableCell>
                  <TableCell>{i18n.t("deletedTickets.when")}</TableCell>
                  <TableCell>{i18n.t("deletedTickets.category")}</TableCell>
                  <TableCell>{i18n.t("deletedTickets.reason")}</TableCell>
                  <TableCell />
                </TableRow>
              </TableHead>
              <TableBody>
                {tickets.map((ticket) => (
                  <TableRow key={ticket.id} hover>
                    <TableCell>{ticket.id}</TableCell>
                    <TableCell>
                      {ticket.contact?.name || ticket.contact?.number}
                    </TableCell>
                    <TableCell>
                      {ticket.queue?.name || ticket.whatsapp?.name || "—"}
                    </TableCell>
                    <TableCell>{ticket.status}</TableCell>
                    <TableCell>
                      {ticket.deletedByName || i18n.t("deletedTickets.removedUser")}
                    </TableCell>
                    <TableCell>
                      {ticket.deletedAt
                        ? format(parseISO(ticket.deletedAt), "dd/MM/yyyy HH:mm")
                        : "—"}
                    </TableCell>
                    <TableCell>
                      {ticket.deletionReasonCategory
                        ? i18n.t(
                            `hideTicketModal.categories.${ticket.deletionReasonCategory}`
                          )
                        : "—"}
                    </TableCell>
                    <TableCell className={classes.reasonCell}>
                      <Tooltip title={ticket.deletionReason || ""}>
                        <span>{ticket.deletionReason}</span>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        onClick={() => history.push(`/tickets-excluidos/${ticket.id}`)}
                      >
                        {i18n.t("deletedTickets.view")}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
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
