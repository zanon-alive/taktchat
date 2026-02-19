import React from "react";
import { Box, Typography, Chip } from "@mui/material";
import MarkdownWrapper from "../MarkdownWrapper";

/**
 * Exibe mensagem do tipo [BUTTON]: texto principal + lista de botões.
 * Se onSelectOption for passado, os botões são clicáveis e enviam o label como resposta.
 */
const ButtonMessagePreview = ({ contentText, buttons, onSelectOption }) => {
  const handleClick = (label) => {
    if (onSelectOption && typeof onSelectOption === "function") {
      onSelectOption(label);
    }
  };

  return (
    <Box sx={{ minWidth: 200, maxWidth: 320, mb: 1 }}>
      {contentText && (
        <Typography component="div" variant="body2" sx={{ mb: 1.5, whiteSpace: "pre-wrap" }}>
          <MarkdownWrapper>{contentText}</MarkdownWrapper>
        </Typography>
      )}
      {Array.isArray(buttons) && buttons.length > 0 && (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
          {buttons.map((btn, idx) => {
            const label = btn.label || btn.id;
            const clickable = !!onSelectOption;
            return (
              <Chip
                key={btn.id || idx}
                label={label}
                size="small"
                variant="outlined"
                onClick={clickable ? () => handleClick(label) : undefined}
                sx={{
                  fontWeight: 500,
                  ...(clickable && { cursor: "pointer", "&:hover": { bgcolor: "action.hover" } }),
                }}
              />
            );
          })}
        </Box>
      )}
    </Box>
  );
};

export default ButtonMessagePreview;
