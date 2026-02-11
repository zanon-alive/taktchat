import React, { useState, useCallback, useEffect, useRef } from "react";
import { makeStyles } from "@mui/styles";
import { Box, Dialog, DialogContent, DialogTitle, IconButton, Tooltip } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { GetApp, PictureAsPdf } from "@mui/icons-material";
import { Document, Page, pdfjs } from "react-pdf";

// Configura o worker do pdf.js (necessário para renderização)
pdfjs.GlobalWorkerOptions.workerSrc =
  `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const useStyles = makeStyles((theme) => ({
  thumbWrapper: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.mode === "light" ? "#f5f5f5" : "#1f1f1f",
    borderRadius: 8,
    overflow: "hidden",
    width: 140,
    height: 180,
    position: "relative",
    cursor: "pointer",
    flexShrink: 0,
    [theme.breakpoints.down('sm')]: {
      width: 110,
      height: 140,
    },
  },
  pdfIconFallback: {
    color: theme.palette.error.main,
    fontSize: 64,
  },
  pageCanvas: {
    display: "block",
    width: "100%",
    height: "100%",
    objectFit: "contain",
    background: theme.mode === "light" ? "#fff" : "#111",
  },
  modalContent: {
    position: "relative",
    padding: 0,
    background: theme.mode === "light" ? "#f5f5f5" : "#0f0f10",
  },
  modalToolbar: {
    position: "absolute",
    top: 8,
    right: 8,
    zIndex: 2,
    display: "flex",
    gap: 4,
  },
  modalPage: {
    maxWidth: "90vw",
    maxHeight: "85vh",
  },
}));

const PdfModal = ({ url }) => {
  const classes = useStyles();
  const [open, setOpen] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const wrapRef = useRef(null);
  const [thumbWidth, setThumbWidth] = useState(140);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) {
        const w = Math.floor(e.contentRect.width || 0);
        if (w) setThumbWidth(w);
      }
    });
    ro.observe(el);
    // medir inicial
    try {
      const w = Math.floor(el.getBoundingClientRect().width || 0);
      if (w) setThumbWidth(w);
    } catch {}
    return () => ro.disconnect();
  }, []);

  const onLoadSuccess = useCallback(() => {
    setLoadError(false);
  }, []);

  const onLoadError = useCallback(() => {
    setLoadError(true);
  }, []);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleDownload = async () => {
    try {
      const res = await fetch(url);
      if (!res.ok) return;
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = (url || "").split("/").pop() || "arquivo.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch {}
  };

  return (
    <>
      <div ref={wrapRef} className={classes.thumbWrapper} onClick={handleOpen} title="Visualizar PDF">
        {!loadError ? (
          <Document file={url} onLoadSuccess={onLoadSuccess} onLoadError={onLoadError} loading={
            <PictureAsPdf className={classes.pdfIconFallback} />
          }>
            <Page pageNumber={1} width={thumbWidth} renderAnnotationLayer={false} renderTextLayer={false} className={classes.pageCanvas} />
          </Document>
        ) : (
          <PictureAsPdf className={classes.pdfIconFallback} />
        )}
      </div>

      <Dialog open={open} onClose={(e, reason) => { if (reason !== "backdropClick" && reason !== "escapeKeyDown") handleClose(); }} maxWidth={false}>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <span>Visualizar PDF</span>
            <Box display="flex" gap={1}>
              <Tooltip title="Baixar PDF">
                <IconButton onClick={handleDownload} color="inherit" size="small">
                  <GetApp />
                </IconButton>
              </Tooltip>
              <IconButton onClick={handleClose} size="small" aria-label="fechar">
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent className={classes.modalContent}>
          <Document file={url} onLoadSuccess={onLoadSuccess} onLoadError={onLoadError}>
            <Page pageNumber={1} renderAnnotationLayer={false} renderTextLayer={false} className={classes.modalPage} />
          </Document>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PdfModal;
