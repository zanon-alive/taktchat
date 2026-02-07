import React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import CloseIcon from "@mui/icons-material/Close";

import { i18n } from "../../translate/i18n";

const InformationModal = ({ title, children, open, onClose }) => {
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
					{i18n.t("Fechar")}
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default InformationModal;