import React, { useState, useEffect, useContext } from "react";
import { useHistory } from "react-router-dom";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  IconButton,
  CircularProgress,
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import AddIcon from "@mui/icons-material/Add";
import BlockIcon from "@mui/icons-material/Block";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PaymentIcon from "@mui/icons-material/Payment";
import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";
import { toast } from "react-toastify";
import useLicenses from "../../hooks/useLicenses";
import useCompanies from "../../hooks/useCompanies";
import usePlans from "../../hooks/usePlans";
import ConfirmationModal from "../../components/ConfirmationModal";
import toastError from "../../errors/toastError";
import { AuthContext } from "../../context/Auth/AuthContext";
import { useDate } from "../../hooks/useDate";

export default function Licenses() {
  const history = useHistory();
  const { user, loading: authLoading } = useContext(AuthContext);
  const { dateToClient } = useDate();
  const { list, save, remove, update, registerPayment } = useLicenses();
  const { list: listCompanies } = useCompanies();
  const { list: listPlans } = usePlans();

  const [licenses, setLicenses] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [licenseToDelete, setLicenseToDelete] = useState(null);
  const [saving, setSaving] = useState(false);
  const [filters, setFilters] = useState({
    companyId: "",
    status: "",
    planId: ""
  });
  const [form, setForm] = useState({
    companyId: "",
    planId: "",
    startDate: new Date().toISOString().slice(0, 10),
    endDate: "",
    status: "active",
  });

  const canAccessLicenses = user?.super || user?.company?.type === "whitelabel";
  const canCreate = canAccessLicenses;

  // Bloqueia acesso pela URL para quem não é super nem whitelabel
  useEffect(() => {
    if (authLoading || !user?.id) return;
    if (!canAccessLicenses) {
      toast.error("Você não tem permissão para acessar esta página. Redirecionando...");
      history.replace("/");
    }
  }, [authLoading, user?.id, canAccessLicenses, history]);

  const loadLicenses = async () => {
    setLoading(true);
    try {
      const filterParams = {};
      if (filters.companyId) filterParams.companyId = filters.companyId;
      if (filters.status) filterParams.status = filters.status;
      if (filters.planId) filterParams.planId = filters.planId;
      
      const data = await list(filterParams);
      setLicenses(Array.isArray(data?.licenses) ? data.licenses : Array.isArray(data) ? data : []);
    } catch (e) {
      toast.error("Não foi possível carregar as licenças.");
      toastError(e);
    }
    setLoading(false);
  };

  const loadCompaniesAndPlans = async () => {
    try {
      const [companiesData, plansData] = await Promise.all([
        listCompanies(),
        listPlans(),
      ]);
      setCompanies(Array.isArray(companiesData) ? companiesData : []);
      setPlans(Array.isArray(plansData) ? plansData : []);
    } catch (e) {
      toastError(e);
    }
  };

  useEffect(() => {
    loadLicenses();
  }, [filters]);

  useEffect(() => {
    if (modalOpen && canCreate) {
      loadCompaniesAndPlans();
    }
  }, [modalOpen, canCreate]);

  useEffect(() => {
    loadCompaniesAndPlans();
  }, []);

  const handleOpenModal = () => {
    setForm({
      companyId: "",
      planId: "",
      startDate: new Date().toISOString().slice(0, 10),
      endDate: "",
      status: "active",
    });
    setModalOpen(true);
  };

  const handleCloseModal = () => setModalOpen(false);

  const handleSubmit = async () => {
    if (!form.companyId || !form.planId || !form.startDate) {
      toast.error("Preencha empresa, plano e data de início.");
      return;
    }
    setSaving(true);
    try {
      await save({
        companyId: Number(form.companyId),
        planId: Number(form.planId),
        startDate: form.startDate,
        endDate: form.endDate || null,
        status: form.status,
      });
      toast.success("Licença criada com sucesso.");
      handleCloseModal();
      loadLicenses();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Não foi possível criar a licença.");
      toastError(e);
    }
    setSaving(false);
  };

  const handleDeleteClick = (license) => {
    setLicenseToDelete(license);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!licenseToDelete) return;
    try {
      await remove(licenseToDelete.id);
      toast.success("Licença excluída.");
      loadLicenses();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Não foi possível excluir.");
      toastError(e);
    }
    setDeleteModalOpen(false);
    setLicenseToDelete(null);
  };

  const handleSuspendToggle = async (license) => {
    const newStatus = license.status === "suspended" ? "active" : "suspended";
    try {
      await update(license.id, { status: newStatus });
      toast.success(newStatus === "suspended" ? "Licença suspensa." : "Licença reativada.");
      loadLicenses();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Não foi possível alterar o status.");
      toastError(e);
    }
  };

  const handleRegisterPayment = async (license) => {
    try {
      await registerPayment(license.id);
      toast.success("Pagamento registrado com sucesso.");
      loadLicenses();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Não foi possível registrar o pagamento.");
      toastError(e);
    }
  };

  // Não exibir conteúdo enquanto redireciona quem não tem permissão
  if (!authLoading && user?.id && !canAccessLicenses) {
    return null;
  }

  return (
    <MainContainer>
      <MainHeader>
        <Title>Licenças</Title>
        {canCreate && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleOpenModal}
          >
            Nova licença
          </Button>
        )}
      </MainHeader>
      <Paper variant="outlined" sx={{ mt: 2, p: 2 }}>
        <div style={{ display: "flex", gap: 16, marginBottom: 16, flexWrap: "wrap" }}>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Empresa</InputLabel>
            <Select
              value={filters.companyId}
              label="Empresa"
              onChange={(e) => setFilters({ ...filters, companyId: e.target.value })}
            >
              <MenuItem value="">Todas</MenuItem>
              {companies.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={filters.status}
              label="Status"
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="active">Ativa</MenuItem>
              <MenuItem value="suspended">Suspensa</MenuItem>
              <MenuItem value="overdue">Vencida</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Plano</InputLabel>
            <Select
              value={filters.planId}
              label="Plano"
              onChange={(e) => setFilters({ ...filters, planId: e.target.value })}
            >
              <MenuItem value="">Todos</MenuItem>
              {plans.map((p) => (
                <MenuItem key={p.id} value={p.id}>
                  {p.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            onClick={() => setFilters({ companyId: "", status: "", planId: "" })}
          >
            Limpar filtros
          </Button>
        </div>
        {loading ? (
          <div style={{ padding: 24, textAlign: "center" }}>
            <CircularProgress />
          </div>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Empresa</TableCell>
                <TableCell>Plano</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Início</TableCell>
                <TableCell>Fim</TableCell>
                <TableCell>Recorrência</TableCell>
                {canCreate && <TableCell align="right">Ações</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {licenses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={canCreate ? 7 : 6}>
                    Nenhuma licença encontrada.
                  </TableCell>
                </TableRow>
              ) : (
                licenses.map((lic) => (
                  <TableRow key={lic.id}>
                    <TableCell>
                      {lic.company?.name ?? lic.companyId}
                    </TableCell>
                    <TableCell>
                      {lic.plan?.name ?? lic.planId}
                    </TableCell>
                    <TableCell>
                      <span style={{
                        color: lic.status === "active" ? "green" : lic.status === "suspended" ? "orange" : "red",
                        fontWeight: "bold"
                      }}>
                        {lic.status === "active" ? "Ativa" : lic.status === "suspended" ? "Suspensa" : lic.status === "overdue" ? "Vencida" : lic.status}
                      </span>
                    </TableCell>
                    <TableCell>{dateToClient(lic.startDate)}</TableCell>
                    <TableCell>
                      {lic.endDate ? dateToClient(lic.endDate) : "-"}
                    </TableCell>
                    <TableCell>{lic.recurrence || lic.plan?.recurrence || "-"}</TableCell>
                    {canCreate && (
                      <TableCell align="right">
                        {user?.super && (
                          <>
                            <IconButton
                              size="small"
                              color={lic.status === "suspended" ? "success" : "warning"}
                              onClick={() => handleSuspendToggle(lic)}
                              title={lic.status === "suspended" ? "Reativar acesso" : "Suspender acesso"}
                            >
                              {lic.status === "suspended" ? <CheckCircleIcon /> : <BlockIcon />}
                            </IconButton>
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleRegisterPayment(lic)}
                              title="Registrar pagamento"
                            >
                              <PaymentIcon />
                            </IconButton>
                          </>
                        )}
                        {!user?.super && lic.status === "active" && (
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleRegisterPayment(lic)}
                            title="Registrar pagamento"
                          >
                            <PaymentIcon />
                          </IconButton>
                        )}
                        <IconButton
                          size="small"
                          color="secondary"
                          onClick={() => handleDeleteClick(lic)}
                        >
                          <DeleteOutlineIcon />
                        </IconButton>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </Paper>

      <Dialog open={modalOpen} onClose={handleCloseModal} maxWidth="sm" fullWidth>
        <DialogTitle>Nova licença</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="dense">
            <InputLabel>Empresa</InputLabel>
            <Select
              value={form.companyId}
              label="Empresa"
              onChange={(e) =>
                setForm((f) => ({ ...f, companyId: e.target.value }))
              }
            >
              <MenuItem value="">Selecione</MenuItem>
              {companies.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="dense">
            <InputLabel>Plano</InputLabel>
            <Select
              value={form.planId}
              label="Plano"
              onChange={(e) =>
                setForm((f) => ({ ...f, planId: e.target.value }))
              }
            >
              <MenuItem value="">Selecione</MenuItem>
              {plans.map((p) => (
                <MenuItem key={p.id} value={p.id}>
                  {p.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            margin="dense"
            label="Data de início"
            type="date"
            value={form.startDate}
            onChange={(e) =>
              setForm((f) => ({ ...f, startDate: e.target.value }))
            }
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            fullWidth
            margin="dense"
            label="Data de fim (opcional)"
            type="date"
            value={form.endDate}
            onChange={(e) =>
              setForm((f) => ({ ...f, endDate: e.target.value }))
            }
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>Cancelar</Button>
          <Button
            onClick={handleSubmit}
            color="primary"
            variant="contained"
            disabled={saving}
          >
            {saving ? "Salvando…" : "Criar"}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmationModal
        title="Excluir licença"
        open={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setLicenseToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
      >
        Deseja realmente excluir esta licença?
      </ConfirmationModal>
    </MainContainer>
  );
}
