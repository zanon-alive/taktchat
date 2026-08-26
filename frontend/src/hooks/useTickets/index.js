import React, { useState, useEffect, useRef } from "react";
import { useHistory } from "react-router-dom";
import { toast } from "react-toastify";
import toastError from "../../errors/toastError";
import { format, sub } from 'date-fns'
import api from "../../services/api";
import { i18n } from "../../translate/i18n";

const useTickets = ({
  searchParam,
  tags,
  users,
  pageNumber,
  status,
  date,
  updatedAt,
  showAll,
  queueIds,
  withUnreadMessages,
  whatsappIds,
  statusFilter,
  forceSearch,
  userFilter,
  sortTickets,
  searchOnMessages,
  entrySource
}) => {
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [count, setCount] = useState(0);
  const isMountedRef = useRef(true);
  const history = useHistory();

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      const fetchTickets = async () => {
        if (userFilter === undefined || userFilter === null) {
          const parsedQueueIds = typeof queueIds === 'string' ? JSON.parse(queueIds || '[]') : (queueIds || []);
          const shouldSkipFetch = Array.isArray(parsedQueueIds) && parsedQueueIds.length === 0 && status !== "search";

          if (shouldSkipFetch) {
            setLoading(true);
            setTickets([]);
            setHasMore(false);
            setCount(0);
            return;
          }

          try {
            const { data } = await api.get("/tickets", {
              params: {
                searchParam,
                pageNumber,
                tags,
                users,
                status,
                date,
                updatedAt,
                showAll,
                queueIds,
                withUnreadMessages,
                whatsapps: whatsappIds,
                statusFilter,
                sortTickets,
                searchOnMessages,
                ...(entrySource ? { entrySource } : {})
              },
            });
            
            // Verificar se o componente ainda está montado antes de atualizar o estado
            if (!isMountedRef.current) {
              return;
            }
            let tickets = [];
            
            tickets = data.tickets;
            setTickets(tickets);
            setHasMore(data.hasMore);
            setCount(data.count);
            setLoading(false);
            if (data.settingsCreated) {
              toast.warning(
                <span>
                  {i18n.t("tickets.toasts.settingsCreated")}{" "}
                  <strong style={{ textDecoration: "underline" }}>
                    {i18n.t("tickets.toasts.openSettings")}
                  </strong>
                </span>,
                {
                  toastId: "company-settings-created",
                  autoClose: 8000,
                  onClick: () => {
                    history.push("/settings");
                  },
                }
              );
            }
          } catch (err) {
            if (isMountedRef.current) {
              setLoading(false);
              toastError(err);
            }
          }
        } else {
          try {
            // console.log("ENTROU AQUI DASH")
            // console.log(status,
            //   showAll,
            //   queueIds,
            //   format(sub(new Date(), { days: 30 }), 'yyyy-MM-dd'),
            //   format(new Date(), 'yyyy-MM-dd'),
            //   userFilter)

            const {data} = await api.get("/dashboard/moments", {
              params: {
                status,
                showAll,
                queueIds,
                dateStart: format(sub(new Date(), { days: 30 }), 'yyyy-MM-dd'),
                dateEnd: format(new Date(), 'yyyy-MM-dd'),
                userId: userFilter
              }
            })

            // Verificar se o componente ainda está montado antes de atualizar o estado
            if (!isMountedRef.current) {
              return;
            }

            // console.log(data)
            let tickets = [];
            tickets = data.filter(item => item.userId == userFilter);            

            setTickets(tickets);
            setHasMore(null);
            setLoading(false);
          } catch (err) {
            if (isMountedRef.current) {
              setLoading(false);
              toastError(err);
            }
          }
        }
      };
    fetchTickets();
    }, 500);
    return () => {
      clearTimeout(delayDebounceFn);
    };
  }, [
    searchParam,
    tags,
    users,
    pageNumber,
    status,
    date,
    updatedAt,
    showAll,
    queueIds,
    withUnreadMessages,
    whatsappIds,
    statusFilter,
    forceSearch,
    sortTickets,
    searchOnMessages,
    userFilter,
    entrySource
  ]);

  return { tickets, loading, hasMore, count };
};

export default useTickets;
