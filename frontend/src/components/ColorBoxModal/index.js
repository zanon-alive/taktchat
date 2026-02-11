import React, { useEffect, useState } from "react";
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { makeStyles } from "@mui/styles";
import { ColorBox } from "material-ui-color";


const useStyles = makeStyles((theme) => ({
    btnWrapper: {
        position: "relative",
    },
}));

const ColorBoxModal = ({ onChange, currentColor, handleClose, open }) => {

    const classes = useStyles();
    const [selectedColor, setSelectedColor] = useState(currentColor);

    useEffect(() => {
        setSelectedColor(currentColor);
    }, [currentColor]);

    const handleOk = () => {
        onChange(selectedColor);
        handleClose();
    };

    return (

        <Dialog open={open} onClose={(e, reason) => { if (reason !== "backdropClick" && reason !== "escapeKeyDown") handleClose(); }}>

            <DialogTitle>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <span>Escolha uma cor</span>
                <IconButton onClick={handleClose} size="small" aria-label="fechar">
                  <CloseIcon />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent>
                <ColorBox
                    disableAlpha={true}
                    hslGradient={false}
                    style={{ margin: '20px auto 0' }}
                    value={selectedColor}
                    onChange={setSelectedColor} />
            </DialogContent>

            <DialogActions>

                <Button onClick={handleClose} color="primary">
                    Cancelar
                </Button>
                <Button
                    color="primary"
                    variant="contained"
                    className={classes.btnWrapper}
                    onClick={handleOk} >
                    OK
                </Button>
            </DialogActions>
        </Dialog>
    )
}
export default ColorBoxModal;