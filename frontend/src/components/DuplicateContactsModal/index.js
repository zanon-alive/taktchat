import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Divider,
  Box,
  Radio,
  FormControlLabel,
  Checkbox,
  IconButton,
  Tooltip
} from "@material-ui/core";
import { RefreshCw, Trash2, GitMerge, Search } from "lucide-react";
import { toast } from "react-toastify";
import api from "../../services/api";
import toastError from "../../errors/toastError";

const DEFAULT_LIMIT = 10;

const DuplicateContactsModal = ({ open, onClose, onActionCompleted }) => {
  const [loading, setLoading] = useState(false);
  const [groups, setGroups] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(DEFAULT_LIMIT);
  const [total, setTotal] = useState(0);
  const [selectedGroupIndex, setSelectedGroupIndex] = useState(0);
  const [groupState, setGroupState] = useState({});
  const [initialFetchDone, setInitialFetchDone] = useState(false);

  const totalPages = useMemo(() => {
    if (!total) return 0;
    return Math.ceil(total / limit);
  }, [total, limit]);

  const currentGroup = useMemo(() => groups[selectedGroupIndex] || null, [groups, selectedGroupIndex]);

  const ensureGroupState = useCallback((data) => {
    setGroupState(prev => {
      const next = { ...prev };
      data.forEach(group => {
        const canonical = group.canonicalNumber;
        if (!next[canonical]) {
          const masterId = group.contacts?.[0]?.id || null;
          const duplicateIds = group.contacts?.filter(contact => contact.id !== masterId).map(contact => contact.id) || [];
          next[canonical] = {
            masterId,
            selectedIds: new Set(duplicateIds)
          };
        } else {
          // Garantir que master selecionado ainda exista
          const availableIds = new Set(group.contacts.map(contact => contact.id));
          if (!availableIds.has(next[canonical].masterId)) {
            const fallbackMaster = group.contacts?.[0]?.id || null;
            next[canonical].masterId = fallbackMaster;
          }
          const selected = Array.from(next[canonical].selectedIds).filter(id => availableIds.has(id) && id !== next[canonical].masterId);
          next[canonical].selectedIds = new Set(selected);
        }
      });
      return next;
    });
  }, []);

  const fetchDuplicates = useCallback(async (pageToLoad = 1) => {
    try {
      setLoading(true);
      const { data } = await api.get("/contacts/duplicates", {
        params: {
          page: pageToLoad,
          limit
        }
      });

      const groupsResponse = data?.groups || [];
      setGroups(groupsResponse);
      setPage(data?.page || pageToLoad);
      setTotal(data?.total || 0);
      ensureGroupState(groupsResponse);

      if (groupsResponse.length > 0) {
        setSelectedGroupIndex(0);
      }

      setInitialFetchDone(true);
    } catch (err) {
      toastError(err);
    } finally {
      setLoading(false);
    }
  }, [ensureGroupState, limit]);

  useEffect(() => {
    if (open) {
      setGroups([]);
      setGroupState({});
      setInitialFetchDone(false);
      setSelectedGroupIndex(0);
      setTotal(0);
      setPage(1);
    }
  }, [open]);

  const handleSelectGroup = (index) => {
    setSelectedGroupIndex(index);
  };

  const handleSelectMaster = (canonicalNumber, masterId) => {
    setGroupState(prev => {
      const next = { ...prev };
      const group = next[canonicalNumber];
      if (!group) return prev;
      const newSelected = new Set(Array.from(group.selectedIds));
      newSelected.delete(masterId);
      next[canonicalNumber] = {
        masterId,
        selectedIds: newSelected
      };
      return next;
    });
  };

  const handleToggleDuplicate = (canonicalNumber, contactId) => {
    setGroupState(prev => {
      const next = { ...prev };
      const group = next[canonicalNumber];
      if (!group) return prev;
      const selectedIds = new Set(Array.from(group.selectedIds));
      if (selectedIds.has(contactId)) {
        selectedIds.delete(contactId);
      } else {
        if (contactId !== group.masterId) {
          selectedIds.add(contactId);
        }
      }
      next[canonicalNumber] = {
        ...group,
        selectedIds
      };
      return next;
    });
  };

  const executeAction = async ({ mode, operation }) => {
    if (!currentGroup) return;

    const state = groupState[currentGroup.canonicalNumber];
    if (!state || !state.masterId) {
      toast.warn("Selecione um contato principal para continuar.");
      return;
    }

    const payload = {
      canonicalNumber: currentGroup.canonicalNumber,
      masterId: state.masterId,
      mode,
      operation
    };

    if (mode === "selected") {
      const selectedIds = Array.from(state.selectedIds).filter(id => id !== state.masterId);
      if (!selectedIds.length) {
        toast.warn("Selecione ao menos um contato duplicado.");
        return;
      }
      payload.targetIds = selectedIds;
    }

    try {
      setLoading(true);
      await api.post("/contacts/duplicates/process", payload);
      toast.success(operation === "merge" ? "Duplicados mesclados com sucesso." : "Duplicados removidos com sucesso.");
      if (onActionCompleted) {
        onActionCompleted();
      }
      await fetchDuplicates(page);
    } catch (err) {
      toastError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;
    onClose();
  };

  const renderContacts = () => {
    if (!currentGroup) {
      return (
        <Typography variant="body2" color="textSecondary">
          Nenhum grupo selecionado.
        </Typography>
      );
    }

    const state = groupState[currentGroup.canonicalNumber] || { masterId: null, selectedIds: new Set() };
    const selectedIds = new Set(Array.from(state.selectedIds));

    return (
      <List dense>
        {currentGroup.contacts.map(contact => (
          <React.Fragment key={contact.id}>
            <ListItem alignItems="flex-start">
              <Box display="flex" flexDirection="column" width="100%">
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <FormControlLabel
                    control={
                      <Radio
                        color="primary"
                        checked={state.masterId === contact.id}
                        onChange={() => handleSelectMaster(currentGroup.canonicalNumber, contact.id)}
                      />
                    }
                    label={<Typography variant="subtitle2">Principal</Typography>}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        color="primary"
                        checked={selectedIds.has(contact.id)}
                        onChange={() => handleToggleDuplicate(currentGroup.canonicalNumber, contact.id)}
                        disabled={state.masterId === contact.id}
                      />
                    }
                    label={<Typography variant="subtitle2">Duplicado</Typography>}
                  />
                </Box>
                <ListItemText
                  primary={`${contact.name || "(sem nome)"}`}
                  secondary={
                    <Box component="span" display="flex" flexDirection="column" gridGap={4}>
                      <Typography variant="body2">Número: {contact.number}</Typography>
                      <Typography variant="body2">Atualizado em: {new Date(contact.updatedAt).toLocaleString()}</Typography>
                      {contact.email ? <Typography variant="body2">Email: {contact.email}</Typography> : null}
                    </Box>
                  }
                />
              </Box>
            </ListItem>
            <Divider component="li" />
          </React.Fragment>
        ))}
      </List>
    );
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
      <DialogTitle>Gerenciar contatos duplicados</DialogTitle>
      <DialogContent dividers style={{ minHeight: 360 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="body2" color="textSecondary">
            Utilize os botões abaixo para localizar contatos compartilhando o mesmo número canônico e definir ações.
          </Typography>
          <Box display="flex" alignItems="center" gridGap={8}>
            <Tooltip title="Localizar duplicados">
              <span>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => fetchDuplicates(1)}
                  startIcon={<Search size={16} />}
                  disabled={loading}
                >
                  Localizar duplicados
                </Button>
              </span>
            </Tooltip>
            <IconButton onClick={() => fetchDuplicates(page)} disabled={loading || !initialFetchDone}>
              <RefreshCw size={18} />
            </IconButton>
          </Box>
        </Box>

        {loading && (
          <Box display="flex" justifyContent="center" alignItems="center" py={4}>
            <CircularProgress size={32} />
          </Box>
        )}

        {!loading && initialFetchDone && groups.length === 0 && (
          <Box display="flex" flexDirection="column" alignItems="center" py={6}>
            <Typography variant="body2" color="textSecondary">
              Nenhum grupo duplicado encontrado.
            </Typography>
          </Box>
        )}

        {!loading && groups.length > 0 && (
          <Box display="flex" gridGap={16}>
            <Box flex={1} maxHeight={360} overflow="auto" borderRight="1px solid rgba(0,0,0,0.08)">
              <List dense>
                {groups.map((group, index) => (
                  <React.Fragment key={group.canonicalNumber}>
                    <ListItem
                      button
                      selected={selectedGroupIndex === index}
                      onClick={() => handleSelectGroup(index)}
                    >
                      <ListItemText
                        primary={`Número: ${group.canonicalNumber}`}
                        secondary={`Contatos duplicados: ${group.total}`}
                      />
                    </ListItem>
                    <Divider component="li" />
                  </React.Fragment>
                ))}
              </List>
              {totalPages > 1 && (
                <Box display="flex" justifyContent="space-between" alignItems="center" p={1}>
                  <Button
                    size="small"
                    onClick={() => fetchDuplicates(Math.max(page - 1, 1))}
                    disabled={page <= 1 || loading}
                  >
                    Anterior
                  </Button>
                  <Typography variant="caption">Página {page} de {totalPages}</Typography>
                  <Button
                    size="small"
                    onClick={() => fetchDuplicates(Math.min(page + 1, totalPages))}
                    disabled={page >= totalPages || loading}
                  >
                    Próxima
                  </Button>
                </Box>
              )}
            </Box>

            <Box flex={2} maxHeight={360} overflow="auto">
              {renderContacts()}
            </Box>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>Fechar</Button>
        <Box display="flex" alignItems="center" gridGap={8} mr={2}>
          <Tooltip title="Mesclar apenas selecionados">
            <span>
              <Button
                color="primary"
                variant="contained"
                onClick={() => executeAction({ mode: "selected", operation: "merge" })}
                disabled={loading || !currentGroup}
                startIcon={<GitMerge size={16} />}
              >
                Mesclar selecionados
              </Button>
            </span>
          </Tooltip>
          <Tooltip title="Mesclar todos os duplicados do grupo atual">
            <span>
              <Button
                color="primary"
                variant="outlined"
                onClick={() => executeAction({ mode: "all", operation: "merge" })}
                disabled={loading || !currentGroup}
              >
                Mesclar todos
              </Button>
            </span>
          </Tooltip>
          <Tooltip title="Apagar duplicados selecionados">
            <span>
              <Button
                color="secondary"
                variant="contained"
                onClick={() => executeAction({ mode: "selected", operation: "delete" })}
                disabled={loading || !currentGroup}
                startIcon={<Trash2 size={16} />}
              >
                Apagar selecionados
              </Button>
            </span>
          </Tooltip>
          <Tooltip title="Apagar todos os duplicados (manter apenas o principal)">
            <span>
              <Button
                color="secondary"
                variant="outlined"
                onClick={() => executeAction({ mode: "all", operation: "delete" })}
                disabled={loading || !currentGroup}
              >
                Apagar todos
              </Button>
            </span>
          </Tooltip>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default DuplicateContactsModal;
