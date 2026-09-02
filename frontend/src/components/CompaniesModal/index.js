import React, { useState, useEffect } from "react";

import * as Yup from "yup";
import { Formik, Form, Field } from "formik";
import { toast } from "react-toastify";

import {
	Box,
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
	FormHelperText,
	TextField,
	InputAdornment,
	IconButton,
	FormControlLabel,
	Switch,
	Typography,
	Divider
} from '@mui/material';

import { Visibility, VisibilityOff } from '@mui/icons-material';
import CloseIcon from '@mui/icons-material/Close';

import { makeStyles } from "@mui/styles";
import { green } from "@mui/material/colors";

import { i18n } from "../../translate/i18n";

import api from "../../services/api";
import toastError from "../../errors/toastError";
import usePlans from "../../hooks/usePlans";

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
	licenseSection: {
		marginTop: theme.spacing(1),
		marginBottom: theme.spacing(1),
	},
}));

const utcDatePlusDays = (days = 0) => {
	const date = new Date();
	date.setUTCHours(0, 0, 0, 0);
	date.setUTCDate(date.getUTCDate() + days);
	return date.toISOString().slice(0, 10);
};

const defaultLicenseDates = () => ({
	licenseStartDate: utcDatePlusDays(0),
	licenseEndDate: utcDatePlusDays(30),
});

const formatDateBr = isoDate => {
	if (!isoDate) return "";
	const [year, month, day] = String(isoDate).slice(0, 10).split("-");
	if (!year || !month || !day) return "";
	return `${day}/${month}/${year}`;
};

const toUtcDateOnlyMs = value => {
	const iso = String(value).slice(0, 10);
	const date = new Date(`${iso}T00:00:00.000Z`);
	return Number.isNaN(date.getTime()) ? 0 : date.getTime();
};

const buildCompanySchema = requireLicense =>
	Yup.object().shape({
		name: Yup.string()
			.min(2, "Parâmetros incompletos!")
			.max(50, "Parâmetros acima do esperado!")
			.required("Nome é obrigatório"),
		email: Yup.string().email("Email é inválido").required("E-mail é obrigatório"),
		passwordDefault: Yup.string().required("Senha é obrigatória"),
		numberAttendants: Yup.number(),
		numberConections: Yup.number(),
		planId: requireLicense
			? Yup.number()
				.transform((value, original) =>
					original === "" || original === null ? undefined : value
				)
				.typeError("Plano é obrigatório")
				.required("Plano é obrigatório")
			: Yup.mixed().nullable(),
		licenseStartDate: requireLicense
			? Yup.string().required("Data de início é obrigatória")
			: Yup.string(),
		licenseEndDate: requireLicense
			? Yup.string()
				.required("Data de término é obrigatória")
				.test(
					"end-gte-start",
					"Término deve ser igual ou posterior ao início",
					function endAfterStart(end) {
						const start = this.parent.licenseStartDate;
						if (!start || !end) return true;
						return end >= start;
					}
				)
			: Yup.string(),
	});

const CompanyModal = ({ open, onClose, companyId, onSave }) => {
	const classes = useStyles();
	const { list: listPlans } = usePlans();

	const initialState = {
		name: "",
		email: "",
		passwordDefault: "",
		password: "",
		document: "",
		planId: "",
		numberAttendants: 1,
		numberConections: 1,
		status: false,
		...defaultLicenseDates()
	};

	const [company, setCompany] = useState(initialState);
	const [showPassword, setShowPassword] = useState(false);
	const [plans, setPlans] = useState([]);
	const [hasVigenteLicense, setHasVigenteLicense] = useState(false);
	const [vigenteUntil, setVigenteUntil] = useState(null);

	useEffect(() => {
		if (!open) return undefined;
		let cancelled = false;
		const loadPlans = async () => {
			try {
				const data = await listPlans();
				if (!cancelled) {
					setPlans(Array.isArray(data) ? data : []);
				}
			} catch (err) {
				if (!cancelled) toastError(err);
			}
		};
		loadPlans();
		return () => {
			cancelled = true;
		};
	}, [open]);

	useEffect(() => {
		const fetchCompany = async () => {
			if (!companyId) {
				setHasVigenteLicense(false);
				setVigenteUntil(null);
				return;
			}
			try {
				const { data } = await api.get(`/companies/listPlan/${companyId}`);
				const { data: licensePayload } = await api.get("/licenses", {
					params: { companyId, status: "active" }
				});
				const licenses = Array.isArray(licensePayload?.licenses)
					? licensePayload.licenses
					: Array.isArray(licensePayload)
						? licensePayload
						: [];
				const today = toUtcDateOnlyMs(utcDatePlusDays(0));
				const vigente = licenses.find(
					license =>
						license?.endDate &&
						toUtcDateOnlyMs(license.endDate) >= today
				);
				setHasVigenteLicense(Boolean(vigente));
				setVigenteUntil(
					vigente?.endDate ? String(vigente.endDate).slice(0, 10) : null
				);
				setCompany(prevState => {
					const normalizedData = {
						name: data.name ?? "",
						email: data.email ?? "",
						document: data.document ?? "",
						planId: data.planId ?? (data.plan?.id ?? ""),
						passwordDefault: "",
						numberAttendants: data.numberAttendants ?? 1,
						numberConections: data.numberConections ?? 1,
						status: data.status ?? false,
						...defaultLicenseDates(),
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
		setCompany({ ...initialState, ...defaultLicenseDates() });
		setHasVigenteLicense(false);
		setVigenteUntil(null);
	};

	const requireLicense = !companyId || !hasVigenteLicense;

	const handleSaveCompany = async values => {
		const companyData = { ...values };
		try {
			if (companyId) {
				if (companyData.passwordDefault && companyData.passwordDefault !== "") {
					companyData.password = companyData.passwordDefault;
				}
				delete companyData.passwordDefault;
				delete companyData.numberAttendants;
				delete companyData.numberConections;
				if (companyData.planId) {
					companyData.planId = Number(companyData.planId);
				}
				if (!companyData.document) {
					companyData.document = "";
				}
				if (!companyData.email || companyData.email === "") {
					companyData.email = company.email || "";
				}
				companyData.id = Number(companyId);
				if (hasVigenteLicense) {
					delete companyData.licenseStartDate;
					delete companyData.licenseEndDate;
				} else {
					companyData.planId = Number(companyData.planId);
				}
				await api.put(`/companies/${companyId}`, companyData);
			} else {
				if (companyData.passwordDefault) {
					companyData.password = companyData.passwordDefault;
					delete companyData.passwordDefault;
				}
				delete companyData.numberAttendants;
				delete companyData.numberConections;
				companyData.planId = Number(companyData.planId);
				if (!companyData.document) {
					companyData.document = "";
				}
				await api.post("/companies", companyData);
			}
			toast.success(i18n.t("companyModal.success"));
			if (typeof onSave === "function") {
				await onSave();
			}
		} catch (err) {
			toastError(err);
		}
		handleClose();
	};

	return (
		<div className={classes.root}>
			<Dialog
				open={open}
				onClose={(e, reason) => { if (reason !== "backdropClick" && reason !== "escapeKeyDown") handleClose(); }}
				maxWidth="sm"
				fullWidth
				scroll="paper"
			>
				<DialogTitle id="form-dialog-title">
					<Box display="flex" justifyContent="space-between" alignItems="center">
						<span>{companyId ? i18n.t("companyModal.title.edit") : i18n.t("companyModal.title.add")}</span>
						<IconButton onClick={handleClose} size="small" aria-label="fechar">
							<CloseIcon />
						</IconButton>
					</Box>
				</DialogTitle>
				<Formik
					initialValues={{
						name: company.name ?? "",
						email: company.email ?? "",
						document: company.document ?? "",
						planId: company.planId ?? "",
						passwordDefault: company.passwordDefault ?? "",
						numberAttendants: company.numberAttendants ?? 1,
						numberConections: company.numberConections ?? 1,
						status: company.status ?? false,
						licenseStartDate: company.licenseStartDate ?? utcDatePlusDays(0),
						licenseEndDate: company.licenseEndDate ?? utcDatePlusDays(30),
					}}
					enableReinitialize={true}
					validationSchema={buildCompanySchema(requireLicense)}
					onSubmit={(values, actions) => {
						setTimeout(() => {
							handleSaveCompany(values);
							actions.setSubmitting(false);
						}, 400);
					}}
				>
					{({ values, touched, errors, isSubmitting }) => (
						<Form noValidate>
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

								<Box className={classes.licenseSection}>
									<Divider />
									<Typography variant="subtitle2" style={{ marginTop: 12, marginBottom: 8 }}>
										{i18n.t("companyModal.form.licenseSection")}
									</Typography>
									{companyId && hasVigenteLicense ? (
										<Typography variant="body2">
											{i18n.t("companyModal.form.licenseCurrent", {
												date: formatDateBr(vigenteUntil)
											})}
										</Typography>
									) : (
										<>
											<FormControl
												variant="outlined"
												margin="dense"
												fullWidth
												error={touched.planId && Boolean(errors.planId)}
											>
												<InputLabel id="company-plan-label">
													{i18n.t("companyModal.form.plan")}
												</InputLabel>
												<Field
													as={Select}
													labelId="company-plan-label"
													id="planId"
													name="planId"
													label={i18n.t("companyModal.form.plan")}
												>
													<MenuItem value="">
														<em>{i18n.t("companyModal.form.planPlaceholder")}</em>
													</MenuItem>
													{plans.map(plan => (
														<MenuItem key={plan.id} value={plan.id}>
															{plan.name}
														</MenuItem>
													))}
												</Field>
												{touched.planId && errors.planId && (
													<FormHelperText>{errors.planId}</FormHelperText>
												)}
											</FormControl>
											<div className={classes.multFieldLine}>
												<Field
													as={TextField}
													type="date"
													name="licenseStartDate"
													label={i18n.t("companyModal.form.licenseStartDate")}
													InputLabelProps={{ shrink: true }}
													error={touched.licenseStartDate && Boolean(errors.licenseStartDate)}
													helperText={touched.licenseStartDate && errors.licenseStartDate}
													variant="outlined"
													margin="dense"
													fullWidth
												/>
												<Field
													as={TextField}
													type="date"
													name="licenseEndDate"
													label={i18n.t("companyModal.form.licenseEndDate")}
													InputLabelProps={{ shrink: true }}
													error={touched.licenseEndDate && Boolean(errors.licenseEndDate)}
													helperText={touched.licenseEndDate && errors.licenseEndDate}
													variant="outlined"
													margin="dense"
													fullWidth
												/>
											</div>
										</>
									)}
								</Box>
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
