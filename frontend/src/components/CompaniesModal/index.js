import React, { useState, useEffect, useContext } from "react";

import * as Yup from "yup";
import { Formik, Form, Field } from "formik";
import { toast } from "react-toastify";

import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	CircularProgress,
	Select,
	InputLabel,
	MenuItem,
	FormControl,
	TextField,
	InputAdornment,
	IconButton,
	FormControlLabel,
	Switch
} from '@material-ui/core';

import { Visibility, VisibilityOff } from '@material-ui/icons';

import { makeStyles } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";

import { i18n } from "../../translate/i18n";

import api from "../../services/api";
import toastError from "../../errors/toastError";

const useStyles = makeStyles(theme => ({
	root: {
		display: "flex",
		flexWrap: "wrap",
	},
	multFieldLine: {
		display: "flex",
		"& > *:not(:last-child)": {
			marginRight: theme.spacing(1),
		},
	},

	btnWrapper: {
		position: "relative",
	},

	buttonProgress: {
		color: green[500],
		position: "absolute",
		top: "50%",
		left: "50%",
		marginTop: -12,
		marginLeft: -12,
	},
	formControl: {
		margin: theme.spacing(1),
		minWidth: 120,
	},
}));

// *************** MODIFICAÇÃO AQUI: ADICIONANDO VALIDAÇÃO DE SENHA ***************
const CompanySchema = Yup.object().shape({
	name: Yup.string()
		.min(2, "Parâmetros incompletos!")
		.max(50, "Parâmetros acima do esperado!")
		.required("Nome é obrigatório"),
	email: Yup.string().email("Email é inválido").required("E-mail é obrigatório"),
	// Adicionado passwordDefault como campo obrigatório.
	// Você pode adicionar min/max para comprimento da senha se desejar.
	passwordDefault: Yup.string().required("Senha é obrigatória"), //
	numberAttendants: Yup.number(),
	numberConections: Yup.number(),
});

const CompanyModal = ({ open, onClose, companyId }) => {
	const classes = useStyles();

	const initialState = {
		name: "",
		email: "",
		passwordDefault: "",
		password: "",
		document: "",
		planId: null,
		numberAttendants: 1,
		numberConections: 1,
		status: false
	};

	const [company, setCompany] = useState(initialState);
	const [showPassword, setShowPassword] = useState(false);

	useEffect(() => {
		const fetchCompany = async () => {
			if (!companyId) return;
			try {
				const { data } = await api.get(`/companies/listPlan/${companyId}`);
				setCompany(prevState => {
					// Normaliza os dados do backend, convertendo null/undefined para valores padrão
					// Quando editar uma empresa, a senha não deve vir preenchida
					// do backend por segurança. Definimos como string vazia para
					// que o usuário possa preencher apenas se quiser alterar.
					const normalizedData = {
						name: data.name ?? "",
						email: data.email ?? "",
						document: data.document ?? "",
						planId: data.planId ?? (data.plan?.id ?? null),
						passwordDefault: "", // Sempre vazio na edição por segurança
						numberAttendants: data.numberAttendants ?? 1,
						numberConections: data.numberConections ?? 1,
						status: data.status ?? false,
					};
					return { ...prevState, ...normalizedData };
				});
			} catch (err) {
				toastError(err);
			}
		};

		fetchCompany();
	}, [companyId, open]);

	const handleClose = () => {
		onClose();
		setCompany(initialState);
	};

	const handleSaveCompany = async values => {
		const companyData = { ...values };
		try {
			if (companyId) {
				console.log("[DEBUG Frontend] Iniciando atualização de empresa");
				console.log("[DEBUG Frontend] companyId:", companyId);
				console.log("[DEBUG Frontend] values recebidos:", values);
				console.log("[DEBUG Frontend] company state:", company);
				
				// Converte passwordDefault para password (nome esperado pelo backend)
				if (companyData.passwordDefault && companyData.passwordDefault !== "") {
					companyData.password = companyData.passwordDefault;
				}
				// Remove passwordDefault pois o backend espera 'password'
				delete companyData.passwordDefault;
				// Remove campos que não são esperados pelo backend
				delete companyData.numberAttendants;
				delete companyData.numberConections;
				// Garante que planId seja um número e está presente
				if (companyData.planId) {
					companyData.planId = Number(companyData.planId);
				}
				// Garante que document esteja presente (obrigatório pelo backend)
				if (!companyData.document) {
					companyData.document = "";
				}
				// Garante que email esteja presente (necessário para atualização)
				if (!companyData.email || companyData.email === "") {
					// Se email não foi fornecido, usa o email atual da empresa
					companyData.email = company.email || "";
				}
				// Inclui o id da empresa no body (pode ser necessário para validação)
				companyData.id = Number(companyId);
				
				console.log("[DEBUG Frontend] Dados finais a serem enviados:", companyData);
				console.log("[DEBUG Frontend] URL da requisição:", `/companies/${companyId}`);
				console.log("[DEBUG Frontend] Base URL da API:", process.env.REACT_APP_BACKEND_URL);
				
				try {
					const response = await api.put(`/companies/${companyId}`, companyData);
					console.log("[DEBUG Frontend] Resposta recebida:", response);
				} catch (error) {
					console.error("[DEBUG Frontend] Erro na requisição:", error);
					console.error("[DEBUG Frontend] Erro response:", error.response);
					console.error("[DEBUG Frontend] Erro status:", error.response?.status);
					console.error("[DEBUG Frontend] Erro data:", error.response?.data);
					throw error;
				}
			} else {
				// Para criação, converte passwordDefault para password
				if (companyData.passwordDefault) {
					companyData.password = companyData.passwordDefault;
					delete companyData.passwordDefault;
				}
				// Remove campos que não são esperados pelo backend
				delete companyData.numberAttendants;
				delete companyData.numberConections;
				// Garante que planId seja um número e está presente
				if (companyData.planId) {
					companyData.planId = Number(companyData.planId);
				}
				// Garante que document esteja presente (obrigatório pelo backend)
				if (!companyData.document) {
					companyData.document = "";
				}
				await api.post("/companies", companyData);
			}
			toast.success(i18n.t("companyModal.success"));
		} catch (err) {
			toastError(err);
		}
		handleClose();
	};

	return (
		<div className={classes.root}>
			<Dialog
				open={open}
				onClose={handleClose}
				maxWidth="xs"
				fullWidth
				scroll="paper"
			>
				<DialogTitle id="form-dialog-title">
					{companyId
						? `${i18n.t("companyModal.title.edit")}`
						: `${i18n.t("companyModal.title.add")}`}
				</DialogTitle>
				<Formik
					initialValues={{
						name: company.name ?? "",
						email: company.email ?? "",
						document: company.document ?? "",
						planId: company.planId ?? null,
						passwordDefault: company.passwordDefault ?? "",
						numberAttendants: company.numberAttendants ?? 1,
						numberConections: company.numberConections ?? 1,
						status: company.status ?? false,
					}}
					enableReinitialize={true}
					validationSchema={CompanySchema}
					onSubmit={(values, actions) => {
						setTimeout(() => {
							handleSaveCompany(values);
							actions.setSubmitting(false);
						}, 400);
					}}
				>
					{({ values, touched, errors, isSubmitting }) => (
						<Form>
							<DialogContent dividers>
								<div className={classes.multFieldLine}>
									<Field
										as={TextField}
										label={i18n.t("companyModal.form.name")}
										autoFocus
										name="name"
										error={touched.name && Boolean(errors.name)}
										helperText={touched.name && errors.name}
										variant="outlined"
										margin="dense"
										fullWidth
									/>
								</div>
								<div className={classes.multFieldLine}>
									<FormControlLabel
										control={
											<Field
												as={Switch}
												color="primary"
												name="status"
												checked={Boolean(values.status)}
											/>
										}
										label={"Ativo"}
									/>
								</div>
								<div className={classes.multFieldLine}>
									<Field
										as={TextField}
										label={i18n.t("companyModal.form.email")}
										name="email"
										error={touched.email && Boolean(errors.email)}
										helperText={touched.email && errors.email}
										variant="outlined"
										margin="dense"
										fullWidth
									/>
								</div>
								<div className={classes.multFieldLine}>
									<Field
										as={TextField}
										name="passwordDefault"
										variant="outlined"
										margin="dense"
										label={i18n.t("companyModal.form.passwordDefault")}
										required
										error={touched.passwordDefault && Boolean(errors.passwordDefault)}
										helperText={touched.passwordDefault && errors.passwordDefault}
										type={showPassword ? 'text' : 'password'}
										InputProps={{
											endAdornment: (
												<InputAdornment position="end">
													<IconButton
														aria-label="toggle password visibility"
														onClick={() => setShowPassword((e) => !e)}
													>
														{showPassword ? <VisibilityOff /> : <Visibility />}
													</IconButton>
												</InputAdornment>
											)
										}}
										fullWidth
									/>
								</div>
								
								{/* Campos comentados, mantidos como no original */}
								{/* <div className={classes.multFieldLine}>
									<Field
										as={TextField}
										label={i18n.t("companyModal.form.numberAttendants")}
										name="numberAttendants"
										error={touched.numberAttendants && Boolean(errors.numberAttendants)}
										helperText={touched.numberAttendants && errors.numberAttendants}
										variant="outlined"
										margin="dense"
										type="number"
										fullWidth
										style={
											// console.log('touched', touched)
											console.log('value', values)
										}
									/>
								</div> */}
								{/* <div className={classes.multFieldLine}>
									<Field
										as={TextField}
										label={i18n.t("companyModal.form.numberConections")}
										name="numberConections"
										error={touched.numberConections && Boolean(errors.numberConections)}
										helperText={touched.numberConections && errors.numberConections}
										variant="outlined"
										margin="dense"
										type="number"
										fullWidth
									/>
								</div> */}
							</DialogContent>
							<DialogActions>
								<Button
									onClick={handleClose}
									color="secondary"
									disabled={isSubmitting}
									variant="outlined"
								>
									{i18n.t("companyModal.buttons.cancel")}
								</Button>
								<Button
									type="submit"
									color="primary"
									disabled={isSubmitting}
									variant="contained"
									className={classes.btnWrapper}
								>
									{companyId
										? `${i18n.t("companyModal.buttons.okEdit")}`
										: `${i18n.t("companyModal.buttons.okAdd")}`}
									{isSubmitting && (
										<CircularProgress
											size={24}
											className={classes.buttonProgress}
										/>
									)}
								</Button>
							</DialogActions>
						</Form>
					)}
				</Formik>
			</Dialog>
		</div>
	);
};

export default CompanyModal;