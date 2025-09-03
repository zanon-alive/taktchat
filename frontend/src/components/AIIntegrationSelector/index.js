import React, { useState, useEffect } from "react";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  Chip,
  CircularProgress
} from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import { makeStyles } from "@material-ui/core/styles";
import api from "../../services/api";

const useStyles = makeStyles((theme) => ({
  formControl: {
    minWidth: 200,
    marginBottom: theme.spacing(1),
  },
  integrationInfo: {
    marginTop: theme.spacing(1),
    padding: theme.spacing(1),
    backgroundColor: "#f5f5f5",
    borderRadius: 4,
  },
  chip: {
    margin: theme.spacing(0.5),
  },
}));

const AIIntegrationSelector = ({ 
  value, 
  onChange, 
  label = "Integração IA",
  required = false,
  error = false,
  helperText = "",
  showDetails = true 
}) => {
  const classes = useStyles();
  const [integrations, setIntegrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIntegration, setSelectedIntegration] = useState(null);

  useEffect(() => {
    const fetchIntegrations = async () => {
      try {
        const { data } = await api.get("/queueIntegration", {
          params: { type: "openai,gemini" }
        });
        
        const aiIntegrations = data.queueIntegrations?.filter(
          integration => integration.type === "openai" || integration.type === "gemini"
        ) || [];
        
        setIntegrations(aiIntegrations);
        setLoading(false);
      } catch (error) {
        console.error("Erro ao buscar integrações IA:", error);
        setLoading(false);
      }
    };

    fetchIntegrations();
  }, []);

  useEffect(() => {
    if (value && integrations.length > 0) {
      const integration = integrations.find(int => int.id === value);
      setSelectedIntegration(integration);
    } else {
      setSelectedIntegration(null);
    }
  }, [value, integrations]);

  const handleChange = (event) => {
    const integrationId = event.target.value;
    const integration = integrations.find(int => int.id === integrationId);
    
    onChange(integrationId, integration);
  };

  if (loading) {
    return (
      <Box display="flex" alignItems="center" gap={1}>
        <CircularProgress size={20} />
        <Typography variant="body2">Carregando integrações...</Typography>
      </Box>
    );
  }

  if (integrations.length === 0) {
    return (
      <Box style={{ padding: 16, backgroundColor: "#fff3cd", border: "1px solid #ffeaa7", borderRadius: 4 }}>
        <Typography variant="body2" color="textSecondary">
          ⚠️ Nenhuma integração OpenAI/Gemini configurada. 
          Configure uma integração em <strong>Integrações → Adicionar → OpenAI/Gemini</strong>
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <FormControl
        variant="outlined"
        className={classes.formControl}
        fullWidth
        error={error}
        required={required}
      >
        <InputLabel>{label}</InputLabel>
        <Select
          value={value || ""}
          onChange={handleChange}
          label={label}
        >
          <MenuItem value="">
            <em>Selecione uma integração</em>
          </MenuItem>
          {integrations.map((integration) => (
            <MenuItem key={integration.id} value={integration.id}>
              <Box display="flex" alignItems="center" gap={1}>
                <Chip 
                  label={integration.type.toUpperCase()} 
                  size="small" 
                  color={integration.type === "openai" ? "primary" : "secondary"}
                />
                {integration.name}
              </Box>
            </MenuItem>
          ))}
        </Select>
        {helperText && (
          <Typography variant="caption" color={error ? "error" : "textSecondary"}>
            {helperText}
          </Typography>
        )}
      </FormControl>

      {showDetails && selectedIntegration && (
        <Box className={classes.integrationInfo}>
          <Typography variant="subtitle2" gutterBottom>
            📋 Configurações da Integração
          </Typography>
          <Box display="flex" flexWrap="wrap" gap={1}>
            <Chip 
              label={`Modelo: ${selectedIntegration.model || "Não definido"}`} 
              size="small" 
              className={classes.chip}
            />
            <Chip 
              label={`Temperatura: ${selectedIntegration.temperature || "1"}`} 
              size="small" 
              className={classes.chip}
            />
            <Chip 
              label={`Máx. Tokens: ${selectedIntegration.maxTokens || "100"}`} 
              size="small" 
              className={classes.chip}
            />
            <Chip 
              label={`API Key: ${selectedIntegration.apiKey ? "✅ Configurada" : "❌ Não configurada"}`} 
              size="small" 
              className={classes.chip}
              color={selectedIntegration.apiKey ? "primary" : "secondary"}
            />
          </Box>
        </Box>
      )}
    </>
  );
};

export default AIIntegrationSelector;
