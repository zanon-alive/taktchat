import React, { useState, useEffect, useReducer, useContext, useMemo, useRef } from "react";

import { makeStyles } from "@mui/styles";
import List from "@mui/material/List";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import TicketListItem from "../TicketListItemCustom";
import TicketsListSkeleton from "../TicketsListSkeleton";

import useTickets from "../../hooks/useTickets";
import { i18n } from "../../translate/i18n";
import { AuthContext } from "../../context/Auth/AuthContext";

const useStyles = makeStyles((theme) => ({
    ticketsListWrapper: {
        position: "relative",
        display: "flex",
        height: "100%",
        flexDirection: "column",
        overflow: "hidden",
        borderTopRightRadius: 0,
        borderBottomRightRadius: 0,
    },

    ticketsList: {
        flex: 1,
        maxHeight: "100%",
        overflowY: "scroll",
        ...theme.scrollbarStyles,
        borderTop: "2px solid rgba(0, 0, 0, 0.12)",
    },

    ticketsListHeader: {
        color: "rgb(67, 83, 105)",
        zIndex: 2,
        backgroundColor: "white",
        borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
    },

    ticketsCount: {
        fontWeight: "normal",
        color: "rgb(104, 121, 146)",
        marginLeft: "8px",
        fontSize: "14px",
    },

    noTicketsText: {
        textAlign: "center",
        color: "rgb(104, 121, 146)",
        fontSize: "14px",
        lineHeight: "1.4",
    },

    noTicketsTitle: {
        textAlign: "center",
        fontSize: "16px",
        fontWeight: "600",
        margin: "0px",
    },

    noTicketsDiv: {
        display: "flex",
        // height: "190px",
        margin: 40,
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
    },
    queueSectionHeader: {
        display: "flex",
        alignItems: "center",
        padding: theme.spacing(1, 2),
        backgroundColor: theme.palette.mode === "light" ? "rgba(0, 0, 0, 0.04)" : "rgba(255, 255, 255, 0.06)",
        borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
        position: "sticky",
        top: 0,
        zIndex: 1,
    },
    queueColorIndicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: theme.spacing(1),
        flexShrink: 0,
    },
    queueSectionTitle: {
        fontWeight: 600,
        fontSize: 13,
        flex: 1,
    },
    queueSectionCount: {
        fontSize: 12,
        color: theme.palette.text.secondary,
    },
}));

const ticketSortAsc = (a, b) => {
    
    if (a.updatedAt < b.updatedAt) {
        return -1;
    }
    if (a.updatedAt > b.updatedAt) {
        return 1;
    }
    return 0;
}

const ticketSortDesc = (a, b) => {
   
    if (a.updatedAt > b.updatedAt) {
        return -1;
    }
    if (a.updatedAt < b.updatedAt) {
        return 1;
    }
    return 0;
}

const sortState = (arr, sortDir) => {
    if (!sortDir || !['ASC', 'DESC'].includes(sortDir)) return arr;
    const copy = [...arr];
    return sortDir === 'ASC' ? copy.sort(ticketSortAsc) : copy.sort(ticketSortDesc);
};

const reducer = (state, action) => {
    const sortDir = action.sortDir;

    if (action.type === "LOAD_TICKETS") {
        const newTickets = action.payload;
        let next = [...state];

        newTickets.forEach((ticket) => {
            const idx = next.findIndex((t) => t.id === ticket.id);
            if (idx !== -1) {
                next = next.map((t, i) => (i === idx ? ticket : t));
                if (ticket.unreadMessages > 0) {
                    const moved = next[idx];
                    const rest = next.filter((_, i) => i !== idx);
                    next = [moved, ...rest];
                }
            } else {
                next = [...next, ticket];
            }
        });
        return sortState(next, sortDir);
    }

    if (action.type === "RESET_UNREAD") {
        const ticketId = action.payload;
        const next = state.map((t) =>
            t.id === ticketId ? { ...t, unreadMessages: 0 } : t
        );
        return sortState(next, sortDir);
    }

    if (action.type === "UPDATE_TICKET") {
        const ticket = action.payload;
        const idx = state.findIndex((t) => t.id === ticket.id);
        let next;
        if (idx !== -1) {
            next = state.map((t, i) => (i === idx ? ticket : t));
        } else {
            next = [ticket, ...state];
        }
        return sortState(next, sortDir);
    }

    if (action.type === "UPDATE_TICKET_UNREAD_MESSAGES") {
        const ticket = action.payload;
        const idx = state.findIndex((t) => t.id === ticket.id);
        let next;
        if (idx !== -1) {
            const updated = state.map((t, i) => (i === idx ? ticket : t));
            const moved = updated[idx];
            const rest = updated.filter((_, i) => i !== idx);
            next = [moved, ...rest];
        } else if (action.status === ticket.status) {
            next = [ticket, ...state];
        } else {
            next = state;
        }
        return sortState(next, sortDir);
    }

    if (action.type === "UPDATE_TICKET_CONTACT") {
        const contact = action.payload;
        return state.map((t) =>
            t.contactId === contact.id ? { ...t, contact } : t
        );
    }

    if (action.type === "DELETE_TICKET") {
        const ticketId = action.payload;
        const next = state.filter((t) => t.id !== ticketId);
        return sortState(next, sortDir);
    }

    if (action.type === "RESET") {
        return [];
    }

    return state;
};

const TicketsListCustom = (props) => {
    const {
        setTabOpen,
        status,
        searchParam,
        searchOnMessages,
        tags,
        users,
        showAll,
        selectedQueueIds,
        queuesForUser = [],
        showNoQueuesAssignedMessage,
        updateCount,
        style,
        whatsappIds,
        forceSearch,
        statusFilter,
        userFilter,
        sortTickets
    } = props;

    const classes = useStyles();
    const isMountedRef = useRef(true);
    const [pageNumber, setPageNumber] = useState(1);
    let [ticketsList, dispatch] = useReducer(reducer, []);
    //   const socketManager = useContext(SocketContext);
    const { user, socket } = useContext(AuthContext);

    const { profile, queues } = user;
    const companyId = user.companyId;

    useEffect(() => {
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    const resetKey = [
        status,
        searchParam || "",
        Array.isArray(selectedQueueIds) ? selectedQueueIds.join(",") : "",
        showAll,
        Array.isArray(tags) ? tags.join(",") : "",
        Array.isArray(users) ? users.join(",") : "",
        forceSearch,
        Array.isArray(whatsappIds) ? whatsappIds.join(",") : "",
        Array.isArray(statusFilter) ? statusFilter.join(",") : "",
        sortTickets,
        searchOnMessages
    ].join("|");
    useEffect(() => {
        dispatch({ type: "RESET" });
        setPageNumber(1);
    }, [resetKey]);

    const { tickets, hasMore, loading } = useTickets({
        pageNumber,
        searchParam,
        status,
        showAll,
        searchOnMessages: searchOnMessages ? "true" : "false",
        tags: JSON.stringify(tags),
        users: JSON.stringify(users),
        queueIds: JSON.stringify(selectedQueueIds),
        whatsappIds: JSON.stringify(whatsappIds),
        statusFilter: JSON.stringify(statusFilter),
        userFilter,
        sortTickets
    });


    useEffect(() => {
        // Verificar se o componente ainda está montado antes de atualizar o estado
        if (!isMountedRef.current) {
            return;
        }
        
        // const queueIds = queues.map((q) => q.id);
        // const filteredTickets = tickets.filter(
        //     (t) => queueIds.indexOf(t.queueId) > -1
        // );
        // const allticket = user.allTicket === 'enabled';
        // if (profile === "admin" || allTicket || allowGroup || allHistoric) {
        if (companyId) {
            dispatch({
                type: "LOAD_TICKETS",
                payload: tickets,
                status,
                sortDir: sortTickets
            });
        }
        // } else {
        //  dispatch({ type: "LOAD_TICKETS", payload: filteredTickets });
        // }

    }, [tickets, companyId, status, sortTickets]);

    useEffect(() => {
        if (!socket || typeof socket.on !== 'function' || !user?.companyId) {
            return;
        }

        const companyId = user.companyId;
        const shouldUpdateTicket = ticket => {
            return (!ticket?.userId || ticket?.userId === user?.id || showAll) &&
                (!ticket?.queueId || selectedQueueIds.indexOf(ticket?.queueId) > -1);
        }
        // const shouldUpdateTicketUser = (ticket) =>
        //     selectedQueueIds.indexOf(ticket?.queueId) > -1 && (ticket?.userId === user?.id || !ticket?.userId);

        const notBelongsToUserQueues = (ticket) =>
            ticket.queueId && selectedQueueIds.indexOf(ticket.queueId) === -1;

        const onCompanyTicketTicketsList = (data) => {
            // console.log("onCompanyTicketTicketsList", data)
            if (data.action === "updateUnread") {
                dispatch({
                    type: "RESET_UNREAD",
                    payload: data.ticketId,
                    status: status,
                    sortDir: sortTickets
                });
            }
            // console.log(shouldUpdateTicket(data.ticket))
            if (data.action === "update" &&
                shouldUpdateTicket(data.ticket) && data.ticket.status === status) {
                dispatch({
                    type: "UPDATE_TICKET",
                    payload: data.ticket,
                    status: status,
                    sortDir: sortTickets
                });
            }

            // else if (data.action === "update" && shouldUpdateTicketUser(data.ticket) && data.ticket.status === status) {
            //     dispatch({
            //         type: "UPDATE_TICKET",
            //         payload: data.ticket,
            //     });
            // }
            if (data.action === "update" && notBelongsToUserQueues(data.ticket)) {
                dispatch({
                    type: "DELETE_TICKET", payload: data.ticket?.id, status: status,
                    sortDir: sortTickets
                });
            }

            if (data.action === "delete") {
                dispatch({
                    type: "DELETE_TICKET", payload: data?.ticketId, status: status,
                    sortDir: sortTickets
                });

            }
        };

        const onCompanyAppMessageTicketsList = (data) => {
            if (data.action === "create" &&
                shouldUpdateTicket(data.ticket) && data.ticket.status === status) {
                dispatch({
                    type: "UPDATE_TICKET_UNREAD_MESSAGES",
                    payload: data.ticket,
                    status: status,
                    sortDir: sortTickets
                });
            }
            // else if (data.action === "create" && shouldUpdateTicketUser(data.ticket) && data.ticket.status === status) {
            //     dispatch({
            //         type: "UPDATE_TICKET_UNREAD_MESSAGES",
            //         payload: data.ticket,
            //     });
            // }
        };

        const onCompanyContactTicketsList = (data) => {
            if (data.action === "update" && data.contact) {
                dispatch({
                    type: "UPDATE_TICKET_CONTACT",
                    payload: data.contact,
                    status: status,
                    sortDir: sortTickets
                });
            }
        };

        const onConnectTicketsList = () => {
            if (socket && typeof socket.emit === 'function') {
                if (status) {
                    socket.emit("joinTickets", status);
                } else {
                    socket.emit("joinNotification");
                }
            }
        }

        socket.on("connect", onConnectTicketsList)
        socket.on(`company-${companyId}-ticket`, onCompanyTicketTicketsList);
        socket.on(`company-${companyId}-appMessage`, onCompanyAppMessageTicketsList);
        socket.on(`company-${companyId}-contact`, onCompanyContactTicketsList);

        return () => {
            if (socket && typeof socket.emit === 'function') {
                try {
                    if (status) {
                        socket.emit("leaveTickets", status);
                    } else {
                        socket.emit("leaveNotification");
                    }
                } catch (e) {
                    console.debug("[TicketsListCustom] error emitting leave", e);
                }
            }
            if (socket && typeof socket.off === 'function') {
                try {
                    socket.off("connect", onConnectTicketsList);
                    socket.off(`company-${companyId}-ticket`, onCompanyTicketTicketsList);
                    socket.off(`company-${companyId}-appMessage`, onCompanyAppMessageTicketsList);
                    socket.off(`company-${companyId}-contact`, onCompanyContactTicketsList);
                } catch (e) {
                    console.debug("[TicketsListCustom] error in cleanup", e);
                }
            }
        };

    }, [status, showAll, user?.companyId, selectedQueueIds, tags, users, profile, queues, sortTickets]);

    useEffect(() => {
        if (typeof updateCount === "function") {
            updateCount(ticketsList.length);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ticketsList]);

    const loadMore = () => {
        setPageNumber((prevState) => prevState + 1);
    };

    const handleScroll = (e) => {
        if (!hasMore || loading) return;

        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;

        if (scrollHeight - (scrollTop + 100) < clientHeight) {
            loadMore();
        }
    };

    if (status && status !== "search") {
        ticketsList = ticketsList.filter(ticket => ticket.status === status);
    }

    const NO_QUEUE_KEY = "no-queue";

    const groupedByQueue = useMemo(() => {
        const noQueueVirtual = {
            id: NO_QUEUE_KEY,
            name: i18n.t("ticketsList.noQueueDefined"),
            color: "#9e9e9e",
            orderQueue: 0
        };
        const queueMap = new Map();
        queueMap.set(NO_QUEUE_KEY, { queue: noQueueVirtual, tickets: [] });

        queuesForUser.forEach((q) => {
            if (!queueMap.has(q.id)) {
                queueMap.set(q.id, { queue: q, tickets: [] });
            }
        });

        ticketsList.forEach((ticket) => {
            const qId = ticket.queueId == null ? NO_QUEUE_KEY : ticket.queueId;
            if (!queueMap.has(qId)) {
                const q = ticket.queue || { id: qId, name: `Fila ${qId}`, color: "#9e9e9e", orderQueue: 999 };
                queueMap.set(qId, { queue: q, tickets: [] });
            }
            queueMap.get(qId).tickets.push(ticket);
        });

        const queueOrder = new Map();
        queueOrder.set(NO_QUEUE_KEY, { order: 0, name: noQueueVirtual.name });
        queuesForUser.forEach((q, idx) => {
            queueOrder.set(q.id, { order: (q.orderQueue ?? idx + 1), name: q.name });
        });

        const sections = Array.from(queueMap.entries()).map(([key, { queue, tickets }]) => ({
            key,
            queue,
            tickets,
            sortOrder: queueOrder.get(key)?.order ?? 999,
            sortName: queueOrder.get(key)?.name ?? queue.name
        }));

        sections.sort((a, b) => {
            if (a.key === NO_QUEUE_KEY) return -1;
            if (b.key === NO_QUEUE_KEY) return 1;
            if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
            return (a.sortName || "").localeCompare(b.sortName || "");
        });

        return sections;
    }, [ticketsList, queuesForUser]);

    const showEmptyNoQueues = showNoQueuesAssignedMessage && !loading && ticketsList.length === 0;

    return (
        <Paper className={classes.ticketsListWrapper} style={style}>
            <Paper
                square
                name="closed"
                elevation={0}
                className={classes.ticketsList}
                onScroll={handleScroll}
            >
                <List style={{ paddingTop: 0 }} >
                    {showEmptyNoQueues ? (
                        <div className={classes.noTicketsDiv}>
                            <span className={classes.noTicketsTitle}>
                                {i18n.t("ticketsList.noTicketsTitle")}
                            </span>
                            <p className={classes.noTicketsText}>
                                {i18n.t("ticketsList.noQueuesAssigned")}
                            </p>
                        </div>
                    ) : (
                        <>
                            {groupedByQueue.map(({ key, queue, tickets }) => (
                                <React.Fragment key={key}>
                                    <Box className={classes.queueSectionHeader}>
                                        <Box
                                            className={classes.queueColorIndicator}
                                            style={{ backgroundColor: queue.color || "#9e9e9e" }}
                                        />
                                        <Typography className={classes.queueSectionTitle}>
                                            {queue.name}
                                        </Typography>
                                        <Typography className={classes.queueSectionCount}>
                                            {tickets.length}
                                        </Typography>
                                    </Box>
                                    {tickets.map((ticket) => (
                                        <TicketListItem
                                            ticket={ticket}
                                            key={ticket.id}
                                            setTabOpen={setTabOpen}
                                        />
                                    ))}
                                </React.Fragment>
                            ))}
                        </>
                    )}
                    {loading && <TicketsListSkeleton />}
                </List>
            </Paper>
        </Paper>
    );
};

export default TicketsListCustom;
