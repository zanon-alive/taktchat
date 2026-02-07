import React, { useCallback, useContext, useEffect, useState } from "react";

import { toast } from "react-toastify";
import api from "../../services/api";
import toastError from "../../errors/toastError";

import {
  Box,
  Button,
  Dialog,
  DialogActions,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import { useHistory } from "react-router-dom";
import { AuthContext } from "../../context/Auth/AuthContext";
import MessagesList from "../MessagesList";
import { ReplyMessageProvider } from "../../context/ReplyingMessage/ReplyingMessageContext";
import { ForwardMessageProvider } from "../../context/ForwarMessage/ForwardMessageContext";

import TicketHeader from "../TicketHeader";
import TicketInfo from "../TicketInfo";

const drawerWidth = 320;

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    height: "100%",
    position: "relative",
    overflow: "hidden",
  },

  mainWrapper: {
    flex: 1,
    height: "100%",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    borderLeft: "0",
    marginRight: -drawerWidth,
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },

  mainWrapperShift: {
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginRight: 0,
  },
}));

export default function TicketMessagesDialog({ open, handleClose, ticketId }) {
  const history = useHistory();
  const classes = useStyles();

  const { user, socket } = useContext(AuthContext);

  const [, setDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [contact, setContact] = useState({});
  const [ticket, setTicket] = useState({});

  const [exportedToPDF, setExportedToPDF] = useState(false);

  
  const handleExportToPDF = async () => {
    const messagesListElement = document.getElementById("messagesList");
    const headerElement = document.getElementById("TicketHeader");

    const pdfOptions = {
      margin: 1,
      filename: `relatório_atendimento_${ticketId}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    if (messagesListElement) {
      const { default: html2pdf } = await import("html2pdf.js");
      const headerClone = headerElement?.cloneNode(true);
      const messagesListClone = messagesListElement.cloneNode(true);

      const containerElement = document.createElement("div");
      if (headerClone) containerElement.appendChild(headerClone);
      containerElement.appendChild(messagesListClone);
      html2pdf()
        .from(containerElement)
        .set(pdfOptions)
        .save();
    } else {
      toastError("Elemento não encontrado para exportar.");
    }
  };

  const handleExportAndClose = async () => {
    if (!exportedToPDF) {
      await handleExportToPDF();
      setExportedToPDF(true);
      handleClose();
    }
  };

  useEffect(() => {
    if (open) {
      handleExportAndClose();
    }
  }, [open, ticketId]);


  return (
    <Dialog maxWidth="md" onClose={handleClose} open={open}>
      <DialogActions>
        <Button onClick={handleExportToPDF} color="primary">
          Exportar para PDF
        </Button>
        <Button onClick={handleClose} color="primary">
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
