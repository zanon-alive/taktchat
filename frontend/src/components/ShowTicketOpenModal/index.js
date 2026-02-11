import React from 'react';
import { Box, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { i18n } from '../../translate/i18n';

const ShowTicketOpen = ({ isOpen, handleClose, user, queue }) => {
  return (
    <Dialog open={isOpen} onClose={(e, reason) => { if (reason !== "backdropClick" && reason !== "escapeKeyDown") handleClose(); }}>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <span>{i18n.t("showTicketOpenModal.title.header")}</span>
          <IconButton onClick={handleClose} size="small" aria-label="fechar">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        {user !== undefined && queue !== undefined && (
          <DialogContentText>
            {i18n.t("showTicketOpenModal.form.message")} <br></br>
            { `${i18n.t("showTicketOpenModal.form.user")}: ${user}`}<br></br>
            {`${i18n.t("showTicketOpenModal.form.queue")}: ${queue}`}<br></br>
          </DialogContentText>
        )}
        {!user && (
          <DialogContentText>
            {i18n.t("showTicketOpenModal.form.messageWait")} <br></br>
            {queue && (`${i18n.t("showTicketOpenModal.form.queue")}: ${queue}`)}<br></br>
          </DialogContentText>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary">
          Fechar
        </Button>
      </DialogActions>
    </Dialog >
  );
};

export default ShowTicketOpen;
