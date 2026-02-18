import React, { useState, useEffect, useContext } from "react";
import {
  Paper,
  Grid,
  FormControl,
  InputLabel,
  MenuItem,
  TextField,
  Table,
  TableHead,
  TableBody,
  TableCell,
  TableRow,
  IconButton,
  Select,
  Alert,
  Box,
  Button,
  InputAdornment,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { makeStyles } from "@mui/styles";
import { Formik, Form, Field } from "formik";
import ButtonWithSpinner from "../ButtonWithSpinner";
import ConfirmationModal from "../ConfirmationModal";

import { Edit as EditIcon, Block as BlockIcon, CheckCircle as CheckCircleIcon } from "@mui/icons-material";

import { toast } from "react-toastify";
import useCompanies from "../../hooks/useCompanies";
import usePlans from "../../hooks/usePlans";
import ModalUsers from "../ModalUsers";
import api from "../../services/api";
import { head, isArray, has } from "lodash";
import { useDate } from "../../hooks/useDate";
import { AuthContext } from "../../context/Auth/AuthContext";

import moment from "moment";
import { i18n } from "../../translate/i18n";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    padding: "2px"
  },
  mainPaper: {
    width: "100%",
    flex: 1,
    // padding: theme.spacing(2), //comentado para retirar o scroll do Empresas
  },
  fullWidth: {
    width: "100%",
  },
  tableContainer: {
    width: "100%",
    // overflowX: "scroll",
    // ...theme.scrollbarStyles,
    padding: "2px",
  },
  textfield: {
    width: "100%",
  },
  textRight: {
    textAlign: "right",
  },
  row: {
    // paddingTop: theme.spacing(2),
    // paddingBottom: theme.spacing(2),
  },
  control: {
    // paddingRight: theme.spacing(1),
    // paddingLeft: theme.spacing(1),
  },
  buttonContainer: {
    textAlign: "right",
    // padding: theme.spacing(1),
  },
}));

export function CompanyForm(props) {
  const { onSubmit, onDelete, onCancel, initialValue, loading, user, whitelabelCompanies = [] } = props;
  const classes = useStyles();
  const [plans, setPlans] = useState([]);
  const [modalUser, setModalUser] = useState(false);
  const [firstUser, setFirstUser] = useState({});

  const [record, setRecord] = useState({
    name: "",
    email: "",
    phone: "",
    planId: "",
    status: true,
    dueDate: "",
    recurrence: "",
    password: "",
    type: "direct",
    parentCompanyId: "",
    trialDaysForChildCompanies: null,
    ...initialValue,
  });

  const { list: listPlans } = usePlans();

  useEffect(() => {
    async function fetchData() {
      const list = await listPlans();
      setPlans(list);
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setRecord((prev) => {
      const next = {
        ...prev,
        ...initialValue,
        trialDaysForChildCompanies: initialValue.trialDaysForChildCompanies ?? null,
        parentCompanyId: initialValue.parentCompanyId ?? "",
      };
      if (initialValue.dueDate && moment(initialValue.dueDate).isValid()) {
        next.dueDate = moment(initialValue.dueDate).format("YYYY-MM-DD");
      } else {
        next.dueDate = "";
      }
      return next;
    });
  }, [initialValue]);

  const handleSubmit = async (data) => {
    if (data.dueDate === "" || moment(data.dueDate).isValid() === false) {
      data.dueDate = null;
    }
    onSubmit(data);
    setRecord({ ...initialValue, dueDate: "" });
  };

  const handleOpenModalUsers = async () => {
    try {
      const { data } = await api.get("/users/list", {
        params: {
          companyId: initialValue.id,
        },
      });
      if (isArray(data) && data.length) {
        setFirstUser(head(data));
      }
      setModalUser(true);
    } catch (e) {
      toast.error(e);
    }
  };

  const handleCloseModalUsers = () => {
    setFirstUser({});
    setModalUser(false);
  };

  const incrementDueDate = () => {
    const data = { ...record };
    if (data.dueDate !== "" && data.dueDate !== null) {
      switch (data.recurrence) {
        case "MENSAL":
          data.dueDate = moment(data.dueDate)
            .add(1, "month")
            .format("YYYY-MM-DD");
          break;
        case "BIMESTRAL":
          data.dueDate = moment(data.dueDate)
            .add(2, "month")
            .format("YYYY-MM-DD");
          break;
        case "TRIMESTRAL":
          data.dueDate = moment(data.dueDate)
            .add(3, "month")
            .format("YYYY-MM-DD");
          break;
        case "SEMESTRAL":
          data.dueDate = moment(data.dueDate)
            .add(6, "month")
            .format("YYYY-MM-DD");
          break;
        case "ANUAL":
          data.dueDate = moment(data.dueDate)
            .add(12, "month")
            .format("YYYY-MM-DD");
          break;
        default:
          break;
      }
    }
    setRecord(data);
  };

  return (
    <>
      <ModalUsers
        userId={firstUser.id}
        companyId={initialValue.id}
        open={modalUser}
        onClose={handleCloseModalUsers}
      />
      <Formik
        enableReinitialize
        className={classes.fullWidth}
        initialValues={record}
        onSubmit={(values, { resetForm }) =>
          setTimeout(() => {
            handleSubmit(values);
            resetForm();
          }, 500)
        }
      >
        {({ values: formValues }) => (
          <Form className={classes.fullWidth}>
            <Grid spacing={1} justifyContent="center" container>
              <Grid xs={12} sm={6} md={3} item>
                <Field
                  as={TextField}
                  label={i18n.t("compaies.table.name")}
                  name="name"
                  variant="outlined"
                  className={classes.fullWidth}
                  margin="dense"
                />
              </Grid>
              <Grid xs={12} sm={6} md={2} item>
                <Field
                  as={TextField}
                  label={i18n.t("compaies.table.email")}
                  name="email"
                  variant="outlined"
                  className={classes.fullWidth}
                  margin="dense"
                  required
                />
              </Grid>
              <Grid xs={12} sm={6} md={2} item>
                <Field
                  as={TextField}
                  label={i18n.t("compaies.table.password")}
                  name="password"
                  variant="outlined"
                  className={classes.fullWidth}
                  margin="dense"
                />
              </Grid>
              <Grid xs={12} sm={6} md={2} item>
                <Field
                  as={TextField}
                  label={i18n.t("compaies.table.phone")}
                  name="phone"
                  variant="outlined"
                  className={classes.fullWidth}
                  margin="dense"
                />
              </Grid>
              <Grid xs={12} sm={6} md={2} item>
                <FormControl margin="dense" variant="outlined" fullWidth>
                  <InputLabel htmlFor="plan-selection">{i18n.t("compaies.table.plan")}</InputLabel>
                  <Field
                    as={Select}
                    id="plan-selection"
                    label={i18n.t("compaies.table.plan")}
                    labelId="plan-selection-label"
                    name="planId"
                    margin="dense"
                    required
                  >
                    {plans.map((plan, key) => (
                      <MenuItem key={key} value={plan.id}>
                        {plan.name}
                      </MenuItem>
                    ))}
                  </Field>
                </FormControl>
              </Grid>
              <Grid xs={12} sm={6} md={1} item>
                <FormControl margin="dense" variant="outlined" fullWidth>
                  <InputLabel htmlFor="status-selection">{i18n.t("compaies.table.active")}</InputLabel>
                  <Field
                    as={Select}
                    id="status-selection"
                    label={i18n.t("compaies.table.active")}
                    labelId="status-selection-label"
                    name="status"
                    margin="dense"
                  >
                    <MenuItem value={true}>{i18n.t("compaies.table.yes")}</MenuItem>
                    <MenuItem value={false}>{i18n.t("compaies.table.no")}</MenuItem>
                  </Field>
                </FormControl>
              </Grid>
              {/* <Grid xs={12} sm={6} md={3} item>
                <FormControl margin="dense" variant="outlined" fullWidth>
                  <InputLabel htmlFor="payment-method-selection">
                    Método de Pagamento
                  </InputLabel>
                  <Field
                    as={Select}
                    id="payment-method-selection"
                    label="Método de Pagamento"
                    labelId="payment-method-selection-label"
                    name="paymentMethod"
                    margin="dense"
                  >
                    <MenuItem value={"pix"}>PIX</MenuItem>
                  </Field>
                </FormControl>
              </Grid> */}
              <Grid xs={12} sm={6} md={2} item>
                <Field
                  as={TextField}
                  label={i18n.t("compaies.table.document")}
                  name="document"
                  variant="outlined"
                  className={classes.fullWidth}
                  margin="dense"
                />
              </Grid>
              {user?.super && !record.id && (
                <>
                  <Grid xs={12} sm={6} md={2} item>
                    <FormControl margin="dense" variant="outlined" fullWidth>
                      <InputLabel id="company-type-label">Tipo de empresa</InputLabel>
                      <Field
                        as={Select}
                        id="company-type"
                        labelId="company-type-label"
                        label="Tipo de empresa"
                        name="type"
                        margin="dense"
                      >
                        <MenuItem value="direct">Direto</MenuItem>
                        <MenuItem value="whitelabel">{i18n.t("companies.typePartner")}</MenuItem>
                      </Field>
                    </FormControl>
                  </Grid>
                  {formValues.type === "direct" && (
                    <Grid xs={12} sm={6} md={2} item>
                      <FormControl margin="dense" variant="outlined" fullWidth>
                        <InputLabel id="parent-company-label">Empresa pai</InputLabel>
                        <Field
                          as={Select}
                          id="parent-company"
                          labelId="parent-company-label"
                          label="Empresa pai"
                          name="parentCompanyId"
                          margin="dense"
                          displayEmpty
                          renderValue={(v) => {
                            if (v == null || v === "") return " ";
                            const c = whitelabelCompanies.find((x) => x.id === v);
                            return c ? c.name : "";
                          }}
                        >
                          <MenuItem value="">
                            <em>Nenhuma</em>
                          </MenuItem>
                          {whitelabelCompanies.map((c) => (
                            <MenuItem key={c.id} value={c.id}>
                              {c.name}
                            </MenuItem>
                          ))}
                        </Field>
                      </FormControl>
                    </Grid>
                  )}
                </>
              )}
              {(user?.super || user?.company?.type === "whitelabel") && record.id && record.type === "whitelabel" && (
                <Grid xs={12} sm={6} md={2} item>
                  <Field
                    as={TextField}
                    label="Dias de trial para empresas-filhas"
                    name="trialDaysForChildCompanies"
                    type="number"
                    variant="outlined"
                    className={classes.fullWidth}
                    margin="dense"
                    inputProps={{ min: 0 }}
                    helperText="Número de dias de trial para novas empresas que se cadastrarem"
                  />
                </Grid>
              )}
              {user?.super && record.id && (record.type === "whitelabel" || record.type === "platform") && (
                <Grid xs={12} sm={6} md={2} item>
                  <TextField
                    label="Tipo"
                    value={record.type === "platform" ? i18n.t("companies.typePlatform") : i18n.t("companies.typePartner")}
                    variant="outlined"
                    fullWidth
                    margin="dense"
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
              )}
              {user?.super && record.id && record.type === "direct" && record.parentCompanyId && (
                <Grid xs={12} sm={6} md={2} item>
                  <TextField
                    label="Empresa pai"
                    value={
                      (() => {
                        const c = whitelabelCompanies.find((x) => x.id === record.parentCompanyId);
                        return c ? c.name : record.parentCompanyId;
                      })()
                    }
                    variant="outlined"
                    fullWidth
                    margin="dense"
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
              )}
              {/* <Grid xs={12} sm={6} md={2} item>
                <FormControl margin="dense" variant="outlined" fullWidth>
                  <InputLabel htmlFor="status-selection">Campanhas</InputLabel>
                  <Field
                    as={Select}
                    id="campaigns-selection"
                    label="Campanhas"
                    labelId="campaigns-selection-label"
                    name="campaignsEnabled"
                    margin="dense"
                  >
                    <MenuItem value={true}>Habilitadas</MenuItem>
                    <MenuItem value={false}>Desabilitadas</MenuItem>
                  </Field>
                </FormControl>
              </Grid> */}
              <Grid xs={12} sm={6} md={2} item>
                <FormControl variant="outlined" fullWidth>
                  <Field
                    as={TextField}
                    label={i18n.t("compaies.table.dueDate")}
                    type="date"
                    name="dueDate"
                    InputLabelProps={{
                      shrink: true,
                    }}
                    variant="outlined"
                    fullWidth
                    margin="dense"
                  />
                </FormControl>
              </Grid>
              <Grid xs={12} sm={6} md={2} item>
                <FormControl margin="dense" variant="outlined" fullWidth>
                  <InputLabel htmlFor="recorrencia-selection">
                  {i18n.t("compaies.table.recurrence")}
                  </InputLabel>
                  <Field
                    as={Select}
                    label="Recorrência"
                    labelId="recorrencia-selection-label"
                    id="recurrence"
                    name="recurrence"
                    margin="dense"
                  >
                    <MenuItem value="MENSAL">{i18n.t("compaies.table.monthly")}</MenuItem>
                    <MenuItem value="BIMESTRAL">{i18n.t("compaies.table.bimonthly")}</MenuItem>
                    <MenuItem value="TRIMESTRAL">{i18n.t("compaies.table.quarterly")}</MenuItem>
                    <MenuItem value="SEMESTRAL">{i18n.t("compaies.table.semester")}</MenuItem>
                    <MenuItem value="ANUAL">{i18n.t("compaies.table.yearly")}</MenuItem>
                  </Field>
                </FormControl>
              </Grid>
              <Grid xs={12} item>
                <Grid justifyContent="flex-end" spacing={1} container>
                  <Grid xs={4} md={1} item>
                    <ButtonWithSpinner
                      className={classes.fullWidth}
                      style={{ marginTop: 7 }}
                      loading={loading}
                      onClick={() => onCancel()}
                      variant="contained"
                    >
                      {i18n.t("compaies.table.clear")}
                    </ButtonWithSpinner>
                  </Grid>
                  {record.id !== undefined ? (
                    <>
                      <Grid xs={6} md={1} item>
                        <ButtonWithSpinner
                          style={{ marginTop: 7 }}
                          className={classes.fullWidth}
                          loading={loading}
                          onClick={() => onDelete(record)}
                          variant="contained"
                          color="secondary"
                        >
                          {i18n.t("compaies.table.delete")}
                        </ButtonWithSpinner>
                      </Grid>
                      <Grid xs={6} md={2} item>
                        <ButtonWithSpinner
                          style={{ marginTop: 7 }}
                          className={classes.fullWidth}
                          loading={loading}
                          onClick={() => incrementDueDate()}
                          variant="contained"
                          color="primary"
                        >
                          {i18n.t("compaies.table.dueDate")}
                        </ButtonWithSpinner>
                      </Grid>
                      {/* <Grid xs={6} md={1} item>
                        <ButtonWithSpinner
                          style={{ marginTop: 7 }}
                          className={classes.fullWidth}
                          loading={loading}
                          onClick={() => handleOpenModalUsers()}
                          variant="contained"
                          color="primary"
                        >
                          {i18n.t("compaies.table.user")}
                        </ButtonWithSpinner>
                      </Grid> */}
                    </>
                  ) : null}
                  <Grid xs={6} md={1} item>
                    <ButtonWithSpinner
                      className={classes.fullWidth}
                      style={{ marginTop: 7 }}
                      loading={loading}
                      type="submit"
                      variant="contained"
                      color="primary"
                    >
                      {i18n.t("compaies.table.save")}
                    </ButtonWithSpinner>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Form>
        )}
      </Formik>
    </>
  );
}

export function CompaniesManagerGrid(props) {
  const { records, onSelect, onBlockAccess } = props;
  const classes = useStyles();
  const { dateToClient, datetimeToClient } = useDate();
  const { user } = useContext(AuthContext);

  const renderStatus = (row) => {
    return row.status === false ? "Não" : "Sim";
  };

  const renderPlan = (row) => {
    return row.planId !== null ? row.plan.name : "-";
  };

  const renderPlanValue = (row) => {
    return row.planId !== null && row.plan !== null ? row.plan.amount ? row.plan.amount.toLocaleString('pt-br', { minimumFractionDigits: 2 }) : '00.00' : "-";
  };

  const renderType = (row) => {
    const t = row.type || "direct";
    if (t === "platform") return i18n.t("companies.typePlatform");
    if (t === "whitelabel") return i18n.t("companies.typePartner");
    return i18n.t("companies.typeDirect");
  };

  // const renderCampaignsStatus = (row) => {
  //   if (
  //     has(row, "settings") &&
  //     isArray(row.settings) &&
  //     row.settings.length > 0
  //   ) {
  //     const setting = row.settings.find((s) => s.key === "campaignsEnabled");
  //     if (setting) {
  //       return setting.value === "true" ? "Habilitadas" : "Desabilitadas";
  //     }
  //   }
  //   return "Desabilitadas";
  // };

  const rowStyle = (record) => {
    if (moment(record.dueDate).isValid()) {
      const now = moment();
      const dueDate = moment(record.dueDate);
      const diff = dueDate.diff(now, "days");
      if (diff >= 1 && diff <= 5) {
        return { backgroundColor: "#fffead" };
      }
      if (diff <= 0) {
        return { backgroundColor: "#fa8c8c" };
      }
      // else {
      //   return { backgroundColor: "#affa8c" };
      // }
    }
    return {};
  };

  return (
    <Paper className={classes.tableContainer}>
      <Table
        className={classes.fullWidth}
        // size="small"
        padding="none"
        aria-label="a dense table"
      >
        <TableHead>
          <TableRow>
            <TableCell align="center" style={{ width: "1%" }}>#</TableCell>
            <TableCell align="left">{i18n.t("compaies.table.name")}</TableCell>
            <TableCell align="center">Tipo</TableCell>
            <TableCell align="left">{i18n.t("compaies.table.email")}</TableCell>
            <TableCell align="center">{i18n.t("compaies.table.phone")}</TableCell>
            <TableCell align="center">{i18n.t("compaies.table.plan")}</TableCell>
            <TableCell align="center">{i18n.t("compaies.table.value")}</TableCell>
            {/* <TableCell align="center">Campanhas</TableCell> */}
            <TableCell align="center">{i18n.t("compaies.table.active")}</TableCell>
            {user?.company?.type === "whitelabel" && (
              <TableCell align="center">Acesso</TableCell>
            )}
            <TableCell align="center">{i18n.t("compaies.table.createdAt")}</TableCell>
            <TableCell align="center">{i18n.t("compaies.table.dueDate")}</TableCell>
            <TableCell align="center">{i18n.t("compaies.table.lastLogin")}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {records.map((row, key) => {
            const isChildCompany = user?.company?.type === "whitelabel" && 
                                   row.type === "direct" && 
                                   row.parentCompanyId === user?.companyId;
            return (
            <TableRow style={rowStyle(row)} key={key}>
              <TableCell align="center" style={{ width: "1%" }}>
                <IconButton onClick={() => onSelect(row)} aria-label="edit">
                  <EditIcon />
                </IconButton>
              </TableCell>
              <TableCell align="left">{row.name || "-"}</TableCell>
              <TableCell align="center">{renderType(row)}</TableCell>
              <TableCell align="left" size="small">{row.email || "-"}</TableCell>
              <TableCell align="center">{row.phone || "-"}</TableCell>
              <TableCell align="center">{renderPlan(row)}</TableCell>
              <TableCell align="center">{i18n.t("compaies.table.money")} {renderPlanValue(row)}</TableCell>
              {/* <TableCell align="center">{renderCampaignsStatus(row)}</TableCell> */}
              <TableCell align="center">{renderStatus(row)}</TableCell>
              {user?.company?.type === "whitelabel" && (
                <TableCell align="center">
                  {isChildCompany && onBlockAccess ? (
                    <IconButton
                      onClick={() => onBlockAccess(row.id, !row.accessBlockedByParent)}
                      aria-label={row.accessBlockedByParent ? "liberar" : "bloquear"}
                      color={row.accessBlockedByParent ? "error" : "success"}
                    >
                      {row.accessBlockedByParent ? <BlockIcon /> : <CheckCircleIcon />}
                    </IconButton>
                  ) : (
                    "-"
                  )}
                </TableCell>
              )}
              <TableCell align="center">{dateToClient(row.createdAt)}</TableCell>
              <TableCell align="center">{dateToClient(row.dueDate)}<br /><span>{row.recurrence}</span></TableCell>
              <TableCell align="center">{datetimeToClient(row.lastLogin)}</TableCell>
            </TableRow>
          )})}
        </TableBody>
      </Table>
    </Paper>
  );
}

export default function CompaniesManager() {
  const classes = useStyles();
  const { user } = useContext(AuthContext);
  const { list, save, update, remove, blockAccess } = useCompanies();

  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState([]);
  const [record, setRecord] = useState({
    name: "",
    email: "",
    phone: "",
    planId: "",
    status: true,
    dueDate: "",
    recurrence: "",
    password: "",
    document: "",
    paymentMethod: "",
    type: "direct",
    parentCompanyId: ""
  });

  const whitelabelCompanies = (records || []).filter((c) => c.type === "whitelabel");

  useEffect(() => {
    loadPlans();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadPlans = async () => {
    setLoading(true);
    try {
      const companyList = await list();
      setRecords(companyList);
    } catch (e) {
      toast.error("Não foi possível carregar a lista de registros");
    }
    setLoading(false);
  };

  const handleSubmit = async (data) => {
    if (data.parentCompanyId === "" || data.type === "whitelabel") {
      data.parentCompanyId = null;
    }
    setLoading(true);
    try {
      if (data.id !== undefined) {
        await update(data);
      } else {
        await save(data);
      }
      await loadPlans();
      handleCancel();
      toast.success("Operação realizada com sucesso!");
    } catch (e) {
      toast.error(
        "Não foi possível realizar a operação. Verifique se já existe uma empresa com o mesmo nome ou se os campos foram preenchidos corretamente"
      );
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await remove(record.id);
      await loadPlans();
      handleCancel();
      toast.success("Operação realizada com sucesso!");
    } catch (e) {
      toast.error("Não foi possível realizar a operação");
    }
    setLoading(false);
  };

  const handleOpenDeleteDialog = () => {
    setShowConfirmDialog(true);
  };

  const handleCancel = () => {
    setRecord((prev) => ({
      ...prev,
      name: "",
      email: "",
      phone: "",
      planId: "",
      status: true,
      dueDate: "",
      recurrence: "",
      password: "",
      document: "",
      paymentMethod: "",
      type: "direct",
      parentCompanyId: "",
      trialDaysForChildCompanies: null
    }));
  };

  const handleSelect = (data) => {
    // let campaignsEnabled = false;

    // const setting = data.settings.find(
    //   (s) => s.key.indexOf("campaignsEnabled") > -1
    // );
    // if (setting) {
    //   campaignsEnabled = setting.value === "true" || setting.value === "enabled";
    // }

    const dueDateFormatted = data.dueDate && moment(data.dueDate).isValid()
      ? moment(data.dueDate).format("YYYY-MM-DD")
      : "";
    setRecord((prev) => ({
      ...prev,
      id: data.id,
      name: data.name || "",
      phone: data.phone || "",
      email: data.email || "",
      planId: data.planId || "",
      status: data.status === false ? false : true,
      dueDate: dueDateFormatted,
      recurrence: data.recurrence || "",
      password: "",
      document: data.document || "",
      paymentMethod: data.paymentMethod || "",
      type: data.type || "direct",
      parentCompanyId: data.parentCompanyId ?? "",
      trialDaysForChildCompanies: data.trialDaysForChildCompanies ?? null
    }));
  };

  const handleBlockAccess = async (companyId, blocked) => {
    setLoading(true);
    try {
      await blockAccess(companyId, blocked);
      await loadPlans();
      toast.success(blocked ? "Acesso bloqueado com sucesso!" : "Acesso liberado com sucesso!");
    } catch (e) {
      toast.error("Não foi possível alterar o acesso da empresa.");
    }
    setLoading(false);
  };

  const getSignupLink = () => {
    if (!user?.companyId) return "";
    const baseUrl = window.location.origin;
    const token = user?.company?.signupToken;
    if (token) {
      return `${baseUrl}/signup-partner?token=${encodeURIComponent(token)}`;
    }
    return `${baseUrl}/signup-partner?partner=${user.companyId}`;
  };

  const handleCopyLink = () => {
    const link = getSignupLink();
    navigator.clipboard.writeText(link).then(() => {
      toast.success("Link copiado para a área de transferência!");
    }).catch(() => {
      toast.error("Não foi possível copiar o link.");
    });
  };

  return (
    <Paper className={classes.mainPaper} elevation={0}>
      <Grid spacing={2} container>
        {user?.company?.type === "whitelabel" && (
          <Grid xs={12} item>
            <Alert severity="info" sx={{ mb: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
                <Box sx={{ flex: 1, minWidth: 200 }}>
                  <strong>Link de cadastro para empresas-filhas:</strong>
                  <TextField
                    fullWidth
                    size="small"
                    value={getSignupLink()}
                    InputProps={{
                      readOnly: true,
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={handleCopyLink} size="small" edge="end">
                            <ContentCopyIcon />
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                    sx={{ mt: 1 }}
                  />
                </Box>
                <Button variant="outlined" onClick={handleCopyLink} startIcon={<ContentCopyIcon />}>
                  Copiar link
                </Button>
              </Box>
            </Alert>
          </Grid>
        )}
        <Grid xs={12} item>
          <CompanyForm
            initialValue={record}
            onDelete={handleOpenDeleteDialog}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            loading={loading}
            user={user}
            whitelabelCompanies={whitelabelCompanies}
          />
        </Grid>
        <Grid xs={12} item>
          <CompaniesManagerGrid records={records} onSelect={handleSelect} onBlockAccess={handleBlockAccess} />
        </Grid>
      </Grid>
      <ConfirmationModal
        title="Exclusão de Registro"
        open={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={() => handleDelete()}
      >
        Deseja realmente excluir esse registro?
      </ConfirmationModal>
    </Paper>
  );
}