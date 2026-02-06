import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const PdfPreview = ({ fileUrl, onLoadSuccess, width = 200, height = 300 }) => {
  const [numPages, setNumPages] = useState(null);

  const onDocumentLoadSuccess = (args) => {
    setNumPages(args.numPages);
    onLoadSuccess?.(args);
  };

  return (
    <Document file={fileUrl} onLoadSuccess={onDocumentLoadSuccess}>
      <Page pageNumber={1} width={width} height={height} />
    </Document>
  );
};

export default PdfPreview;
