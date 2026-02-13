import React, { useState, useEffect, useContext } from "react";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Grid,
} from "@mui/material";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";
import { AuthContext } from "../../context/Auth/AuthContext";
import useDashboard from "../../hooks/useDashboard";
import useCompanies from "../../hooks/useCompanies";
import ForbiddenPage from "../../components/ForbiddenPage";
import toastError from "../../errors/toastError";
import { toast } from "react-toastify";

const PartnerBillingReport = () => {
  const { user } = useContext(AuthContext);
  const {
    getPartnerBillingReport,
    getPartnerBillingSnapshots,
    calculatePartnerBilling,
  } = useDashboard();
  const { list: listCompanies } = useCompanies();

  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [partners, setPartners] = useState([]);
  const [selectedPartnerId, setSelectedPartnerId] = useState("");

  const [snapshots, setSnapshots] = useState([]);
  const [loadingSnapshots, setLoadingSnapshots] = useState(false);
  const [calculating, setCalculating] = useState(false);

  const [licensesDialogOpen, setLicensesDialogOpen] = useState(false);
  const [licensesDialogPartner, setLicensesDialogPartner] = useState(null);

  useEffect(() => {
    async function loadPartners() {
      try {
        const data = await listCompanies();
        const whitelabels = Array.isArray(data)
          ? data.filter((c) => c.type === "whitelabel")
          : [];
        setPartners(whitelabels);
      } catch (err) {
        toastError(err);
      }
    }
    loadPartners();
  }, [listCompanies]);

  const loadSnapshots = async () => {
    setLoadingSnapshots(true);
    try {
      const data = await getPartnerBillingSnapshots({ limit: "50" });
      setSnapshots(Array.isArray(data) ? data : []);
    } catch (err) {
      toastError(err);
    }
    setLoadingSnapshots(false);
  };

  useEffect(() => {
    loadSnapshots();
  }, []);

  const handleCalculatePartnerBilling = async () => {
    setCalculating(true);
    try {
      await calculatePartnerBilling({});
      toast.success("Cobrança do período atual registrada.");
      loadSnapshots();
    } catch (err) {
      toastError(err);
    }
    setCalculating(false);
  };

  const fetchReport = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedPartnerId) {
        params.partnerId = selectedPartnerId;
      }
      const data = await getPartnerBillingReport(params);
      setReport(data);
    } catch (err) {
      toastError(err);
    }
    setLoading(false);
  };

  const handleOpenLicensesDialog = (partner) => {
    setLicensesDialogPartner(partner);
    setLicensesDialogOpen(true);
  };

  const handleCloseLicensesDialog = () => {
    setLicensesDialogOpen(false);
    setLicensesDialogPartner(null);
  };

  const formatCurrency = (value) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(Number(value || 0));

  if (!user?.super) {
    return <ForbiddenPage />;
  }

  const totals = report?.totals || {
    totalPartners: 0,
    totalChildCompanies: 0,
    totalActiveLicenses: 0,
    totalAmountDue: 0,
  };

  return (
    <MainContainer>
      <MainHeader>
        <Title>Relatório de cobrança por parceiro</Title>
      </MainHeader>

      <Paper variant="outlined" sx={{ mt: 2, p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Parceiro whitelabel</InputLabel>
              <Select
                label="Parceiro whitelabel"
                value={selectedPartnerId}
                onChange={(e) => setSelectedPartnerId(e.target.value)}
              >
                <MenuItem value="">Todos</MenuItem>
                {partners.map((p) => (
                  <MenuItem key={p.id} value={p.id}>
                    {p.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Button
              variant="contained"
              color="primary"
              onClick={fetchReport}
              disabled={loading}
            >
              {loading ? "Carregando..." : "Buscar"}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          Cobranças registradas (cálculo automático por período)
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
          Registre o valor devido por parceiro com base nos planos ativos das empresas-filhas no período (mês atual).
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={handleCalculatePartnerBilling}
          disabled={calculating}
          sx={{ mb: 2 }}
        >
          {calculating ? "Calculando..." : "Registrar cobrança do período atual"}
        </Button>
        {loadingSnapshots ? (
          <div style={{ padding: 16, textAlign: "center" }}>
            <CircularProgress size={24} />
          </div>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Parceiro</TableCell>
                <TableCell>Período (início)</TableCell>
                <TableCell>Período (fim)</TableCell>
                <TableCell>Empresas filhas</TableCell>
                <TableCell>Licenças ativas</TableCell>
                <TableCell>Valor devido</TableCell>
                <TableCell>Registrado em</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {snapshots.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7}>
                    Nenhuma cobrança registrada. Clique em &quot;Registrar cobrança do período atual&quot; para calcular e salvar.
                  </TableCell>
                </TableRow>
              )}
              {snapshots.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.partner?.name || `Parceiro #${row.partnerId}`}</TableCell>
                  <TableCell>
                    {row.periodStart ? new Date(row.periodStart).toLocaleDateString("pt-BR") : "-"}
                  </TableCell>
                  <TableCell>
                    {row.periodEnd ? new Date(row.periodEnd).toLocaleDateString("pt-BR") : "-"}
                  </TableCell>
                  <TableCell>{row.childCompaniesCount}</TableCell>
                  <TableCell>{row.activeLicensesCount}</TableCell>
                  <TableCell>{formatCurrency(row.totalAmountDue)}</TableCell>
                  <TableCell>
                    {row.createdAt ? new Date(row.createdAt).toLocaleString("pt-BR") : "-"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>

      {loading && (
        <div style={{ padding: 24, textAlign: "center" }}>
          <CircularProgress />
        </div>
      )}

      {!loading && report && (
        <>
          <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Resumo
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={3}>
                <Typography variant="body2" color="textSecondary">
                  Total de parceiros
                </Typography>
                <Typography variant="h6">{totals.totalPartners}</Typography>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Typography variant="body2" color="textSecondary">
                  Empresas filhas
                </Typography>
                <Typography variant="h6">{totals.totalChildCompanies}</Typography>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Typography variant="body2" color="textSecondary">
                  Licenças ativas
                </Typography>
                <Typography variant="h6">
                  {totals.totalActiveLicenses}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Typography variant="body2" color="textSecondary">
                  Valor total devido
                </Typography>
                <Typography variant="h6">
                  {formatCurrency(totals.totalAmountDue)}
                </Typography>
              </Grid>
            </Grid>
          </Paper>

          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Parceiros
            </Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Parceiro</TableCell>
                  <TableCell>Empresas filhas</TableCell>
                  <TableCell>Licenças ativas</TableCell>
                  <TableCell>Valor devido</TableCell>
                  <TableCell align="right">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(!report.partners || report.partners.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={5}>
                      Nenhum dado encontrado para o filtro informado.
                    </TableCell>
                  </TableRow>
                )}
                {report.partners &&
                  report.partners.map((partner) => (
                    <TableRow key={partner.partnerId}>
                      <TableCell>{partner.partnerName}</TableCell>
                      <TableCell>{partner.childCompaniesCount}</TableCell>
                      <TableCell>{partner.activeLicensesCount}</TableCell>
                      <TableCell>
                        {formatCurrency(partner.totalAmountDue)}
                      </TableCell>
                      <TableCell align="right">
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleOpenLicensesDialog(partner)}
                        >
                          Ver licenças
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </Paper>

          <Dialog
            open={licensesDialogOpen}
            onClose={handleCloseLicensesDialog}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle>
              Licenças do parceiro{" "}
              {licensesDialogPartner?.partnerName || ""}
            </DialogTitle>
            <DialogContent dividers>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Empresa</TableCell>
                    <TableCell>Plano</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Vencimento</TableCell>
                    <TableCell>Dias até o vencimento</TableCell>
                    <TableCell>Valor</TableCell>
                    <TableCell>Recorrência</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(!licensesDialogPartner?.licenses ||
                    licensesDialogPartner.licenses.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={7}>
                        Nenhuma licença encontrada.
                      </TableCell>
                    </TableRow>
                  )}
                  {licensesDialogPartner?.licenses?.map((lic) => (
                    <TableRow key={lic.licenseId}>
                      <TableCell>{lic.companyName}</TableCell>
                      <TableCell>{lic.planName}</TableCell>
                      <TableCell>{lic.status}</TableCell>
                      <TableCell>
                        {lic.endDate
                          ? new Date(lic.endDate).toLocaleDateString("pt-BR")
                          : "-"}
                      </TableCell>
                      <TableCell>
                        {lic.daysUntilExpiry != null
                          ? lic.daysUntilExpiry
                          : "-"}
                      </TableCell>
                      <TableCell>{formatCurrency(lic.amount)}</TableCell>
                      <TableCell>{lic.recurrence || "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseLicensesDialog}>Fechar</Button>
            </DialogActions>
          </Dialog>
        </>
      )}
    </MainContainer>
  );
};

export default PartnerBillingReport;
