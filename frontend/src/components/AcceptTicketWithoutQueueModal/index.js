import React, { useState, useContext, useEffect, useRef } from "react";
import { useHistory } from "react-router-dom";

import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    IconButton,
    InputLabel,
    MenuItem,
    Select
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { makeStyles } from "@mui/styles";
import { v4 as uuidv4 } from "uuid";

import api from "../../services/api";
import { AuthContext } from "../../context/Auth/AuthContext";
import ButtonWithSpinner from "../ButtonWithSpinner";
import { i18n } from "../../translate/i18n";
import toastError from "../../errors/toastError";
import { Form, Formik } from "formik";
import ShowTicketOpen from "../ShowTicketOpenModal";
import useCompanySettings from "../../hooks/useSettings/companySettings";
import { TicketsContext } from "../../context/Tickets/TicketsContext";
import useQueues from "../../hooks/useQueues";

// const filter = createFilterOptions({
// 	trim: true,
// });

const useStyles = makeStyles((theme) => ({
	autoComplete: { 
		width: 300,
		// marginBottom: 20 
	},
	maxWidth: {
		width: "100%",
	},
	buttonColorError: {
		color: theme.palette.error.main,
		borderColor: theme.palette.error.main,
	},
}));

const AcceptTicketWithouSelectQueue = ({ modalOpen, onClose, ticketId, ticket }) => {
	const history = useHistory();
	const classes = useStyles();
	const [selectedQueue, setSelectedQueue] = useState('');
	const [loading, setLoading] = useState(false);
	const [queues, setQueues] = useState([]);
	const { user } = useContext(AuthContext);
	const [ openAlert, setOpenAlert ] = useState(false);
	const [ userTicketOpen, setUserTicketOpen] = useState("");
	const [ queueTicketOpen, setQueueTicketOpen] = useState("");
	const { tabOpen, setTabOpen } = useContext(TicketsContext);
	const { findAll: findAllQueues } = useQueues();
	const isMounted = useRef(true);

	const {get:getSetting} = useCompanySettings();

	// Carregar todas as filas disponíveis quando modal abre
	useEffect(() => {
		return () => {
			isMounted.current = false;
		};
	}, []);

	useEffect(() => {
		if (isMounted.current && modalOpen) {
			const loadQueues = async () => {
				try {
					const list = await findAllQueues();
					setQueues(list || []);
					
					// Se usuário tem apenas uma fila associada, selecionar automaticamente
					if (user.queues && user.queues.length === 1) {
						setSelectedQueue(user.queues[0].id);
					} else if (list && list.length === 1) {
						// Se houver apenas uma fila cadastrada no total, selecionar automaticamente
						setSelectedQueue(list[0].id);
					}
				} catch (err) {
					toastError(err);
				}
			};
			loadQueues();
		}
	}, [modalOpen, findAllQueues, user.queues]);

const handleClose = () => {
	onClose();
	setSelectedQueue("");
};

const handleCloseAlert = () => {
	setOpenAlert(false);
	setLoading(false)
};

const handleSendMessage = async (id) => {
	// Verificar se o ticket existe e é válido
	if (!id || !ticket || !ticket.id) {
		console.warn("[AcceptTicketWithoutQueueModal] Ticket inválido para enviar mensagem", { id, ticket });
		return;
	}

	let isGreetingMessage = false;

	try {
		const  setting  = await getSetting({
			"column":"sendGreetingAccepted"
		});
		if (setting.sendGreetingAccepted === "enabled") isGreetingMessage = true;
	} catch (err) {
		toastError(err);
	}
	
	let settingMessage
	try {
		settingMessage = await getSetting({
			"column": "greetingAcceptedMessage"
		})
	} catch (err) {
		toastError(err);
	}
	
	// Verificar se deve enviar mensagem de saudação
	if (isGreetingMessage && (!ticket.isGroup || ticket.whatsapp?.groupAsTicket === "enabled") && ticket.status === "pending") {
		const msg = settingMessage?.greetingAcceptedMessage || "";
		
		// Verificar se a mensagem não está vazia
		if (!msg || !msg.trim()) {
			console.warn("[AcceptTicketWithoutQueueModal] Mensagem de saudação vazia");
			return;
		}

		const message = {
			read: 1,
			fromMe: true,
			mediaUrl: "",
			body: msg.trim(),
		};
		try {
			await api.post(`/messages/${id}`, message);
		} catch (err) {
			console.error("[AcceptTicketWithoutQueueModal] Erro ao enviar mensagem de saudação:", err);
			toastError(err);
		}
	}
};

const handleUpdateTicketStatus = async (queueId) => {
	// Verificar se o ticketId é válido
	if (!ticketId) {
		toastError("ID do ticket inválido");
		setLoading(false);
		return;
	}

	setLoading(true);
	try {
		const otherTicket = await api.put(`/tickets/${ticketId}`, {
			status: ticket?.isGroup && ticket?.channel === 'whatsapp' ? "group" : "open",
			userId: user?.id || null,
			queueId: queueId
		});

		if (otherTicket.data.id !== ticket?.id) {
			if (otherTicket.data.userId !== user?.id) {
				setOpenAlert(true)
				setUserTicketOpen(otherTicket.data.user.name)
				setQueueTicketOpen(otherTicket.data.queue.name)
			} else {
				setLoading(false);
				setTabOpen(otherTicket.data.isGroup ? "group" : "open");
				history.push(`/tickets/${otherTicket.data.uuid}`);
			}
		} else {
			// Enviar mensagem de saudação se necessário (usar ticketId atualizado)
			const updatedTicketId = otherTicket.data.id || ticketId;
			await handleSendMessage(updatedTicketId);
			setLoading(false);
			setTabOpen(otherTicket.data.isGroup ? "group" : "open");
			history.push(`/tickets/${otherTicket.data.uuid}`);
			handleClose();
		}
	} catch (err) {
		setLoading(false);
		console.error("[AcceptTicketWithoutQueueModal] Erro ao atualizar status do ticket:", err);
		toastError(err);
	}
};

return (
	<>
		<Dialog open={modalOpen} onClose={(e, reason) => { if (reason !== "backdropClick" && reason !== "escapeKeyDown") handleClose(); }}>
			<DialogTitle id="form-dialog-title">
				<Box display="flex" justifyContent="space-between" alignItems="center">
					<span>{i18n.t("ticketsList.acceptModal.title")}</span>
					<IconButton onClick={handleClose} size="small" aria-label="fechar">
						<CloseIcon />
					</IconButton>
				</Box>
			</DialogTitle>
			<DialogContent dividers>
				<FormControl variant="outlined" className={classes.maxWidth}>
					<InputLabel>{i18n.t("ticketsList.acceptModal.queue")}</InputLabel>
					<Select
						value={selectedQueue}
						className={classes.autoComplete}
						onChange={(e) => setSelectedQueue(e.target.value)}
						label={i18n.t("ticketsList.acceptModal.queue")}
					>
						<MenuItem value={''}>&nbsp;</MenuItem>
						{queues && queues.length > 0 ? (
							queues.map((queue) => (
								<MenuItem key={queue.id} value={queue.id}>{queue.name}</MenuItem>
							))
						) : (
							<MenuItem value={''} disabled>Nenhuma fila cadastrada</MenuItem>
						)}
					</Select>
				</FormControl>
			</DialogContent>
			<DialogActions>
				<Button
					onClick={handleClose}
					className={classes.buttonColorError}
					disabled={loading}
					variant="outlined"
				>
					{i18n.t("ticketsList.buttons.cancel")}
				</Button>
				<ButtonWithSpinner
					variant="contained"
					type="button"
					disabled={(selectedQueue === "")}
					onClick={() => handleUpdateTicketStatus(selectedQueue)}
					color="primary"
					loading={loading}
				>
					{i18n.t("ticketsList.buttons.start")}
				</ButtonWithSpinner>
			</DialogActions>
			<ShowTicketOpen
				isOpen={openAlert}
				handleClose={handleCloseAlert}
				user={userTicketOpen}
				queue={queueTicketOpen}
			/>
		</Dialog>
	</>
);
};

export default AcceptTicketWithouSelectQueue;