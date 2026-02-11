import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import CloseIcon from '@mui/icons-material/Close';

export default function ContactNotesEditModal({ open, onClose, note, onSave }) {
  const [editedNote, setEditedNote] = useState(note);

  const handleSave = () => {
    onSave(editedNote); // Chama a função onSave com a nota editada
    onClose(); // Fecha o diálogo de edição
  };

  return (
    <Dialog open={open} onClose={(e, reason) => { if (reason !== "backdropClick" && reason !== "escapeKeyDown") onClose(); }} maxWidth="xs" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <span>Edit Note</span>
          <IconButton onClick={onClose} size="small" aria-label="fechar">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <TextField
          label="Edit Note"
          fullWidth
          multiline
          minRows={4}
          value={note}
          onChange={(e) => setEditedNote(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button onClick={handleSave} color="primary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
