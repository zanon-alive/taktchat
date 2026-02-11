import React, { useState, useEffect } from 'react';
import {
  Grid,
  Checkbox,
  Paper,
  TextField,
  Typography,
  FormControlLabel,
  FormGroup,
  Divider,
  Chip,
  Box,
  CircularProgress
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import SearchIcon from '@mui/icons-material/Search';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import HeadsetMicIcon from '@mui/icons-material/HeadsetMic';
import SendIcon from '@mui/icons-material/Send';
import PeopleIcon from '@mui/icons-material/People';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import SyncAltIcon from '@mui/icons-material/SyncAlt';
import SettingsIcon from '@mui/icons-material/Settings';
import DashboardIcon from '@mui/icons-material/Dashboard';
import CodeIcon from '@mui/icons-material/Code';
import MessageIcon from '@mui/icons-material/Message';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import TimelineIcon from '@mui/icons-material/Timeline';
import ChatIcon from '@mui/icons-material/Chat';
import ScheduleIcon from '@mui/icons-material/Schedule';
import DeviceHubIcon from '@mui/icons-material/DeviceHub';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import BusinessIcon from '@mui/icons-material/Business';
import AnnouncementIcon from '@mui/icons-material/Announcement';
import AllInclusiveIcon from '@mui/icons-material/AllInclusive';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import api from '../../services/api';
import toastError from '../../errors/toastError';

const useStyles = makeStyles((theme) => ({
  root: {
    marginTop: theme.spacing(0.5),
  },
  searchField: {
    marginBottom: theme.spacing(1.5),
  },
  categorySection: {
    marginBottom: theme.spacing(1.5),
  },
  categoryTitle: {
    fontWeight: 600,
    fontSize: '0.9rem',
    color: theme.palette.primary.main,
    marginBottom: theme.spacing(0.5),
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    '& svg': {
      fontSize: '1.1rem',
    },
  },
  selectAllButton: {
    padding: 4,
    marginLeft: theme.spacing(0.5),
  },
  permissionGroup: {
    paddingLeft: theme.spacing(1),
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: theme.spacing(0.5),
    rowGap: theme.spacing(0.25),
  },
  permissionLabel: {
    margin: 0,
    marginLeft: theme.spacing(1),
    '& .MuiTypography-root': {
      fontSize: '0.813rem',
      lineHeight: 1.3,
    },
    '& .MuiCheckbox-root': {
      padding: theme.spacing(0.5),
    },
  },
  selectedCount: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
    padding: theme.spacing(0.75),
    backgroundColor: theme.palette.action.hover,
    borderRadius: theme.shape.borderRadius,
    textAlign: 'center',
  },
  chip: {
    margin: theme.spacing(0.4),
    height: 24,
    fontSize: '0.75rem',
  },
  loading: {
    display: 'flex',
    justifyContent: 'center',
    padding: theme.spacing(4),
  },
}));

// Mapeamento de ícones por categoria
const getCategoryIcon = (categoryName) => {
  const iconMap = {
    'Atendimento': <HeadsetMicIcon />,
    'Tickets': <HeadsetMicIcon />,
    'Campanhas': <SendIcon />,
    'Contatos': <PeopleIcon />,
    'Filas': <AccountTreeIcon />,
    'Conexões': <SyncAltIcon />,
    'Configurações': <SettingsIcon />,
    'Dashboard': <DashboardIcon />,
    'API Externa': <CodeIcon />,
    'Respostas Rápidas': <MessageIcon />,
    'Mensagens Rápidas': <MessageIcon />,
    'Arquivos': <AttachFileIcon />,
    'Flowbuilder': <TimelineIcon />,
    'Chat Interno': <ChatIcon />,
    'Agendamentos': <ScheduleIcon />,
    'Integrações': <DeviceHubIcon />,
    'Usuários': <SupervisorAccountIcon />,
    'Administração': <SupervisorAccountIcon />,
    'Empresas': <BusinessIcon />,
    'Anúncios': <AnnouncementIcon />,
    'IA / Prompts': <AllInclusiveIcon />,
    'Financeiro': <AccountBalanceIcon />,
  };
  
  return iconMap[categoryName] || <SettingsIcon />;
};

/**
 * Componente simplificado para seleção de permissões
 * Usa checkboxes agrupados por categoria
 */
const PermissionTransferList = ({ value = [], onChange, disabled = false }) => {
  const classes = useStyles();
  const [catalog, setCatalog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Carregar catálogo de permissões da API
  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/permissions/catalog');
        setCatalog(Array.isArray(data) ? data : []);
        if (!data || data.length === 0) {
          toastError({ message: 'Nenhuma permissão disponível no catálogo. Verifique configuração do backend.' });
        }
      } catch (error) {
        console.error('Erro ao carregar catálogo de permissões:', error);
        toastError(error);
        setCatalog([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCatalog();
  }, []);

  // Garantir que value é sempre array
  const selectedKeys = Array.isArray(value) ? value : [];

  // Toggle permissão
  const handleTogglePermission = (permissionKey) => {
    const newSelected = selectedKeys.includes(permissionKey)
      ? selectedKeys.filter(key => key !== permissionKey)
      : [...selectedKeys, permissionKey];
    onChange(newSelected);
  };

  // Selecionar todas as permissões de uma categoria
  const handleSelectAllCategory = (category) => {
    const categoryKeys = category.permissions.map(p => p.key);
    const newSelected = [...new Set([...selectedKeys, ...categoryKeys])];
    onChange(newSelected);
  };

  // Filtrar catálogo por busca
  const getFilteredCatalog = () => {
    if (!search) return catalog;
    const searchLower = search.toLowerCase();
    return catalog
      .map(category => ({
        ...category,
        permissions: category.permissions.filter(p =>
          p.label.toLowerCase().includes(searchLower) ||
          p.key.toLowerCase().includes(searchLower) ||
          (p.description && p.description.toLowerCase().includes(searchLower))
        )
      }))
      .filter(category => category.permissions.length > 0);
  };

  if (loading) {
    return (
      <Box className={classes.loading}>
        <CircularProgress size={40} />
      </Box>
    );
  }

  const filteredCatalog = getFilteredCatalog();

  return (
    <Box className={classes.root}>
      {/* Campo de busca */}
      <TextField
        className={classes.searchField}
        placeholder="Buscar permissão..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        fullWidth
        size="small"
        variant="outlined"
        InputProps={{
          startAdornment: <SearchIcon style={{ marginRight: 8, color: '#999' }} />
        }}
      />

      {/* Contador */}
      <Box className={classes.selectedCount}>
        <Typography variant="body2">
          <strong>{selectedKeys.length}</strong> de <strong>{catalog.reduce((sum, c) => sum + c.permissions.length, 0)}</strong> permissões selecionadas
        </Typography>
      </Box>

      <Divider style={{ margin: '16px 0' }} />

      {/* Lista de categorias e permissões */}
      {filteredCatalog.map(category => (
        <Box key={category.category} className={classes.categorySection}>
          <Typography className={classes.categoryTitle}>
            {getCategoryIcon(category.category)}
            {category.category} ({category.permissions.length})
            <Tooltip title="Selecionar todos">
              <IconButton 
                size="small" 
                onClick={() => handleSelectAllCategory(category)}
                disabled={disabled}
                className={classes.selectAllButton}
              >
                <ChevronRightIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Typography>
          <FormGroup className={classes.permissionGroup}>
            {category.permissions.map(permission => (
              <FormControlLabel
                key={permission.key}
                className={classes.permissionLabel}
                control={
                  <Checkbox
                    checked={selectedKeys.includes(permission.key)}
                    onChange={() => handleTogglePermission(permission.key)}
                    disabled={disabled}
                    size="small"
                    color="primary"
                  />
                }
                label={
                  <Box>
                    <Typography variant="body2">{permission.label}</Typography>
                    {permission.description && (
                      <Typography variant="caption" color="textSecondary">
                        {permission.description}
                      </Typography>
                    )}
                  </Box>
                }
              />
            ))}
          </FormGroup>
        </Box>
      ))}

      {/* Preview com chips */}
      {selectedKeys.length > 0 && (
        <Box style={{ marginTop: 16 }}>
          <Divider style={{ marginBottom: 12 }} />
          <Typography variant="subtitle2" gutterBottom>
            Resumo das Permissões:
          </Typography>
          <Box>
            {catalog.flatMap(c => c.permissions)
              .filter(p => selectedKeys.includes(p.key))
              .map(p => (
                <Chip
                  key={p.key}
                  label={p.label}
                  size="small"
                  className={classes.chip}
                  color="primary"
                  onDelete={() => handleTogglePermission(p.key)}
                  disabled={disabled}
                />
              ))}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default PermissionTransferList;
