import React, {
  useContext,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";
import { makeStyles } from "@mui/styles";
import toastError from "../../errors/toastError";
import Popover from "@mui/material/Popover";
import ForumIcon from "@mui/icons-material/Forum";
import {
  Badge,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Paper,
  Typography,
} from "@mui/material";
import api from "../../services/api";
import { isArray } from "lodash";
// import { SocketContext } from "../../context/Socket/SocketContext";
import { useDate } from "../../hooks/useDate";
import { AuthContext } from "../../context/Auth/AuthContext";

import notifySound from "../../assets/chat_notify.mp3";
import useSound from "use-sound";
import { i18n } from "../../translate/i18n";

const useStyles = makeStyles((theme) => ({
  mainPaper: {
    flex: 1,
    maxHeight: 300,
    maxWidth: 500,
    padding: theme.spacing(1),
    overflowY: "scroll",
    ...theme.scrollbarStyles,
  },
}));

const reducer = (state, action) => {
  if (action.type === "LOAD_CHATS") {
    const chats = action.payload;
    const newChats = [];

    if (isArray(chats)) {
      chats.forEach((chat) => {
        const chatIndex = state.findIndex((u) => u.id === chat.id);
        if (chatIndex !== -1) {
          state[chatIndex] = chat;
        } else {
          newChats.push(chat);
        }
      });
    }

    return [...state, ...newChats];
  }

  if (action.type === "UPDATE_CHATS") {
    const chat = action.payload;
    const chatIndex = state.findIndex((u) => u.id === chat.id);

    if (chatIndex !== -1) {
      state[chatIndex] = chat;
      return [...state];
    } else {
      return [chat, ...state];
    }
  }

  if (action.type === "DELETE_CHAT") {
    const chatId = action.payload;

    const chatIndex = state.findIndex((u) => u.id === chatId);
    if (chatIndex !== -1) {
      state.splice(chatIndex, 1);
    }
    return [...state];
  }

  if (action.type === "RESET") {
    return [];
  }

  if (action.type === "CHANGE_CHAT") {
    const changedChats = state.map((chat) => {
      if (chat.id === action.payload.chat.id) {
        return action.payload.chat;
      }
      return chat;
    });
    return changedChats;
  }
};

export default function ChatPopover() {
  const classes = useStyles();

//   const socketManager = useContext(SocketContext);
  const { user, socket, isAuth } = useContext(AuthContext);


  const [loading, setLoading] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [searchParam] = useState("");
  const [chats, dispatch] = useReducer(reducer, []);
  const [invisible, setInvisible] = useState(true);
  const { datetimeToClient } = useDate();
  const [play] = useSound(notifySound);
  const soundAlertRef = useRef();
  const isMountedRef = useRef(true);
  const socketCleanupRef = useRef(null);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      // Executa cleanup do socket imediatamente ao desmontar
      if (socketCleanupRef.current) {
        try {
          socketCleanupRef.current();
        } catch (e) {
          // Ignora erros
        }
        socketCleanupRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    soundAlertRef.current = play;

    if (!("Notification" in window)) {
      console.log("This browser doesn't support notifications");
    } else {
      Notification.requestPermission();
    }
  }, [play]);

  useEffect(() => {
    if (!isMountedRef.current) return;
    if (!isAuth) {
      if (isMountedRef.current) {
        dispatch({ type: "RESET" });
        setPageNumber(1);
      }
      return;
    }
    if (isMountedRef.current) {
      dispatch({ type: "RESET" });
      setPageNumber(1);
    }
  }, [searchParam, isAuth]);

  useEffect(() => {
    if (!isAuth) {
      return;
    }
    if (!isMountedRef.current) return;
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      if (isMountedRef.current) {
        fetchChats();
      }
    }, 500);
    return () => {
      clearTimeout(delayDebounceFn);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParam, pageNumber, isAuth]);

  useEffect(() => {
    if (!isAuth || !user?.companyId || !socket || typeof socket.on !== 'function') {
      return undefined;
    }

    // Marca como não montado imediatamente se isAuth mudar para false
    if (!isMountedRef.current) {
      return undefined;
    }

    const companyId = user?.companyId;
//    const socket = socketManager.GetSocket();

    const onCompanyChatPopover = (data) => {
      // Verificação dupla para garantir que o componente ainda está montado
      if (!isMountedRef.current) return;
      if (data.action === "new-message") {
        if (isMountedRef.current) {
          dispatch({ type: "CHANGE_CHAT", payload: data });
        }
        if (data.newMessage.senderId !== user.id && isMountedRef.current) {
          if (soundAlertRef.current) {
            soundAlertRef.current();
          }
        }
      }
      if (data.action === "update" && isMountedRef.current) {
        dispatch({ type: "CHANGE_CHAT", payload: data });
      }
    }

    socket.on(`company-${companyId}-chat`, onCompanyChatPopover);

    // Armazena função de cleanup para execução imediata no unmount
    const cleanup = () => {
      if (socket && typeof socket.off === 'function') {
        try {
          socket.off(`company-${companyId}-chat`, onCompanyChatPopover);
        } catch (e) {
          // Ignora erros no cleanup
        }
      }
    };
    
    socketCleanupRef.current = cleanup;

    return () => {
      cleanup();
      socketCleanupRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isAuth, socket]);


  useEffect(() => {
    if (!isAuth || !isMountedRef.current) {
      if (isMountedRef.current) {
        setInvisible(true);
      }
      return;
    }
    let unreadsCount = 0;
    if (chats.length > 0) {
      for (let chat of chats) {
        for (let chatUser of chat.users) {
          if (chatUser.userId === user.id) {
            unreadsCount += chatUser.unreads;
          }
        }
      }
    }
    if (isMountedRef.current) {
      if (unreadsCount > 0) {
        setInvisible(false);
      } else {
        setInvisible(true);
      }
    }
  }, [chats, user.id, isAuth]);

  const fetchChats = async () => {
    if (!isAuth || !isMountedRef.current) {
      if (isMountedRef.current) {
        setLoading(false);
      }
      return;
    }
    try {
      const { data } = await api.get("/chats/", {
        params: { searchParam, pageNumber },
      });
      if (isMountedRef.current) {
        dispatch({ type: "LOAD_CHATS", payload: data.records });
        setHasMore(data.hasMore);
        setLoading(false);
      }
    } catch (err) {
      if (isMountedRef.current) {
        toastError(err);
        setLoading(false);
      }
    }
  };

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

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
    setInvisible(true);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const goToMessages = (chat) => {
    window.location.href = `/chats/${chat.uuid}`;
  };

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  return (
    <div>
      <IconButton
        aria-describedby={id}
        variant="contained"
        color={invisible ? "default" : "inherit"}
        onClick={handleClick}
        style={{ color: "white" }}
      >
        <Badge
          color="secondary"
          variant="dot"
          overlap="rectangular"
          invisible={invisible}
        >
          <ForumIcon />
        </Badge>
      </IconButton>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
      >
        <Paper
          variant="outlined"
          onScroll={handleScroll}
          className={classes.mainPaper}
        >
          <List
            component="nav"
            aria-label="main mailbox folders"
            style={{ minWidth: 300 }}
          >
            {isArray(chats) &&
              chats.map((item, key) => (
                <ListItem
                  key={key}
                  style={{
                    background: key % 2 === 0 ? "#F8FAFC" : "white",
                    border: "1px solid #eee",
                    cursor: "pointer",
                  }}
                  onClick={() => goToMessages(item)}
                  button
                >
                  <ListItemText
                    primary={item.lastMessage}
                    secondary={
                      <>
                        <Typography component="span" style={{ fontSize: 12 }}>
                          {datetimeToClient(item.updatedAt)}
                        </Typography>
                        <span style={{ marginTop: 5, display: "block" }}></span>
                      </>
                    }
                  />
                </ListItem>
              ))}
            {isArray(chats) && chats.length === 0 && (
              <ListItemText primary={i18n.t("mainDrawer.appBar.notRegister")} />
            )}
          </List>
        </Paper>
      </Popover>
    </div>
  );
}
