import React, { useEffect, useState, useContext } from "react";
import QRCode from "react-qr-code";
import toastError from "../../errors/toastError";
import { makeStyles } from "@mui/styles";
import { Box, Dialog, DialogContent, DialogTitle, IconButton, Paper, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { i18n } from "../../translate/i18n";
import api from "../../services/api";

import { AuthContext } from "../../context/Auth/AuthContext";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexWrap: "wrap",
  },
}))

const QrcodeModal = ({ open, onClose, whatsAppId }) => {
  const classes = useStyles();
  const [qrCode, setQrCode] = useState("");
  const { user, socket } = useContext(AuthContext);

  useEffect(() => {
    const fetchSession = async () => {
      if (!whatsAppId) return;

      try {
        const { data } = await api.get(`/whatsapp/${whatsAppId}`);
        setQrCode(data.qrcode);
      } catch (err) {
        toastError(err);
      }
    };
    fetchSession();
  }, [whatsAppId]);

  useEffect(() => {
    if (!whatsAppId || !socket || typeof socket.on !== 'function' || !user?.companyId) {
      return;
    }

    const companyId = user?.companyId;
    // const socket = socketConnection({ companyId, userId: user.id });

    const onWhatsappData = (data) => {
      if (data.action === "update" && data.session.id === whatsAppId) {
        setQrCode(data.session.qrcode);
      }

      if (data.action === "update" && data.session.qrcode === "") {
        onClose();
      }
    }
    socket.on(`company-${companyId}-whatsappSession`, onWhatsappData);

    return () => {
      if (socket && typeof socket.off === 'function') {
        try {
          socket.off(`company-${companyId}-whatsappSession`, onWhatsappData);
        } catch (e) {
          console.debug("[QrcodeModal] error in cleanup", e);
        }
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [whatsAppId, onClose, user?.companyId]);

  return (
    <Dialog open={open} onClose={(e, reason) => { if (reason !== "backdropClick" && reason !== "escapeKeyDown") onClose(); }} maxWidth="lg" scroll="paper">
      <DialogTitle>
        <Box display="flex" justifyContent="flex-end" alignItems="center">
          <IconButton onClick={onClose} size="small" aria-label="fechar">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Paper elevation={0}>
          <Typography color="secondary" gutterBottom>
            {i18n.t("qrCode.message")}
          </Typography>
          <div className={classes.root}>
            {qrCode ? (
              <div style={{ backgroundColor: "white", padding: "5px", display: "inline-block" }}>
                <QRCode value={qrCode} size={300} />
              </div>
            ) : (
              <span>Aguardando pelo QR Code</span>
            )}
          </div>
        </Paper>
      </DialogContent>
    </Dialog>
  );
};

export default React.memo(QrcodeModal);
