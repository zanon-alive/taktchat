import React from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

import { i18n } from "../../translate/i18n";

const ConfirmationModal = ({ title, children, open, onClose, onConfirm }) => {
	return (
		<Dialog
			open={open}
			onClose={(e, reason) => { if (reason !== "backdropClick" && reason !== "escapeKeyDown") onClose(false); }}
			aria-labelledby="confirm-dialog"
		>
			<DialogTitle id="confirm-dialog">
				<Box display="flex" justifyContent="space-between" alignItems="center">
					<span>{title}</span>
					<IconButton onClick={() => onClose(false)} size="small" aria-label="fechar">
						<CloseIcon />
					</IconButton>
				</Box>
			</DialogTitle>
			<DialogContent dividers>
				<Typography>{children}</Typography>
			</DialogContent>
			<DialogActions>
				<Button
					variant="contained"
					onClick={() => onClose(false)}
					color="inherit"
				>
					{i18n.t("confirmationModal.buttons.cancel")}
				</Button>
				<Button
					variant="contained"
					onClick={() => {
						onClose(false);
						onConfirm();
					}}
					color="secondary"
				>
					{i18n.t("confirmationModal.buttons.confirm")}
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default ConfirmationModal;
