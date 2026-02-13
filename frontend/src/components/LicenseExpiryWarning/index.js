import React, { useState, useEffect, useContext } from "react";
import { Alert, AlertTitle, Box, Button } from "@mui/material";
import { useHistory } from "react-router-dom";
import { toast } from "react-toastify";
import moment from "moment";
import { AuthContext } from "../../context/Auth/AuthContext";
import useLicenses from "../../hooks/useLicenses";
import { useDate } from "../../hooks/useDate";

const LicenseExpiryWarning = () => {
  const { user } = useContext(AuthContext);
  const { dateToClient } = useDate();
  const { list } = useLicenses();
  const history = useHistory();
  const [license, setLicense] = useState(null);
  const [daysUntilExpiry, setDaysUntilExpiry] = useState(null);

  useEffect(() => {
    if (!user?.companyId) return;
    // Para super, não mostrar aviso (eles gerenciam licenças)
    if (user?.super) return;

    loadLicense();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.companyId, user?.super]);

  const loadLicense = async () => {
    try {
      const licenses = await list();
      const companyLicenses = Array.isArray(licenses)
        ? licenses.filter((l) => l.companyId === user?.companyId)
        : [];
      
      if (companyLicenses.length === 0) return;

      // Buscar licença ativa mais recente (maior endDate)
      const activeLicenses = companyLicenses.filter(
        (l) => l.status === "active" && l.endDate
      );
      
      if (activeLicenses.length === 0) return;

      const activeLicense = activeLicenses.sort((a, b) => 
        moment(b.endDate).diff(moment(a.endDate))
      )[0];

      if (!activeLicense || !activeLicense.endDate) return;

      const today = moment().startOf("day");
      const endDate = moment(activeLicense.endDate).startOf("day");
      const days = endDate.diff(today, "days");

      if (days >= 0 && days <= 15) {
        setLicense(activeLicense);
        setDaysUntilExpiry(days);
      }
    } catch (e) {
      // Silenciar erro - não é crítico
    }
  };

  if (!license || daysUntilExpiry === null) return null;

  const severity = daysUntilExpiry <= 3 ? "error" : daysUntilExpiry <= 7 ? "warning" : "info";

  return (
    <Box sx={{ mb: 2 }}>
      <Alert severity={severity}>
        <AlertTitle>
          {daysUntilExpiry === 0
            ? "Sua licença vence hoje!"
            : daysUntilExpiry === 1
            ? "Sua licença vence amanhã!"
            : `Sua licença vence em ${daysUntilExpiry} dias`}
        </AlertTitle>
        Próximo vencimento: {dateToClient(license.endDate)}
        {user?.super && (
          <Box sx={{ mt: 1 }}>
            <Button
              size="small"
              variant="outlined"
              onClick={() => history.push("/licenses")}
            >
              Gerenciar licenças
            </Button>
          </Box>
        )}
      </Alert>
    </Box>
  );
};

export default LicenseExpiryWarning;
