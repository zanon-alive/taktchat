import React, { useState, useEffect } from 'react';
import CoreDialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

function Dialog ({ title, modalOpen, onClose, children }) {
    const [open, setOpen] = useState(false);

    useEffect(() => {
        setOpen(modalOpen)
    }, [modalOpen])
    
    const handleClose = () => {
        setOpen(false);
        onClose()
    };

    return (
        <>
            <CoreDialog
                open={open}
                onClose={(e, reason) => { if (reason !== "backdropClick" && reason !== "escapeKeyDown") handleClose(); }}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
                disableEnforceFocus
                disableRestoreFocus
            >
                <DialogTitle id="alert-dialog-title">
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <span>{title}</span>
                        <IconButton onClick={handleClose} size="small" aria-label="fechar">
                            <CloseIcon />
                        </IconButton>
                    </Box>
                </DialogTitle>
                {children}
            </CoreDialog>
        </>
    );
}

export default Dialog;