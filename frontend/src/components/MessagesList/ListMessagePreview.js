import React from "react";
import { Box, Typography, Divider } from "@mui/material";

/**
 * Exibe mensagem do tipo [LIST]: título, descrição, seções e itens.
 * Se onSelectOption for passado, os itens são clicáveis e enviam o título da opção como resposta.
 */
const showDesc = (d) => d && d.toLowerCase() !== "sem descrição";
const displayRowTitle = (rowTitle) =>
  (rowTitle || "").replace(/^sem\s+titulo\s*/i, "").trim() || rowTitle || "";

const ListMessagePreview = ({ title, description, footer, sections, onSelectOption }) => {
  const showTitle = title && title.toLowerCase() !== "sem titulo";
  const clickable = !!onSelectOption;

  const handleClick = (row) => {
    if (onSelectOption && typeof onSelectOption === "function") {
      onSelectOption(displayRowTitle(row.title) || row.title);
    }
  };

  return (
    <Box sx={{ minWidth: 200, maxWidth: 320, mb: 1 }}>
      {showTitle && (
        <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 0.5 }}>
          {title}
        </Typography>
      )}
      {description && showDesc(description) && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {description}
        </Typography>
      )}
      {Array.isArray(sections) &&
        sections.map((section, sIdx) => (
          <Box key={sIdx} sx={{ mb: 1 }}>
            {section.title && section.title.toLowerCase() !== "sem titulo" && (
              <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
                {section.title}
              </Typography>
            )}
            {Array.isArray(section.rows) &&
              section.rows.map((row, rIdx) => (
                <Box
                  key={rIdx}
                  onClick={clickable ? () => handleClick(row) : undefined}
                  sx={{
                    py: 0.5,
                    px: 1,
                    borderRadius: 1,
                    bgcolor: "action.hover",
                    mb: 0.5,
                    "&:last-of-type": { mb: 0 },
                    ...(clickable && { cursor: "pointer", "&:hover": { bgcolor: "action.selected" } }),
                  }}
                >
                  <Typography variant="body2" fontWeight={500}>
                    {displayRowTitle(row.title)}
                  </Typography>
                  {row.description && showDesc(row.description) && (
                    <Typography variant="caption" color="text.secondary">
                      {row.description}
                    </Typography>
                  )}
                </Box>
              ))}
          </Box>
        ))}
      {footer && (
        <>
          <Divider sx={{ my: 1 }} />
          <Typography variant="caption" color="text.secondary">
            {footer}
          </Typography>
        </>
      )}
    </Box>
  );
};

export default ListMessagePreview;
