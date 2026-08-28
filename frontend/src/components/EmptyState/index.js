import React from "react";
import { Box, Button, Typography } from "@mui/material";

const EmptyState = ({ title, description, actionLabel, onAction }) => {
  return (
    <Box sx={{ textAlign: "center", py: 6, px: 2 }}>
      <Typography variant="subtitle1" color="text.primary" gutterBottom>
        {title}
      </Typography>
      {description && (
        <Typography variant="body2" color="text.secondary" paragraph>
          {description}
        </Typography>
      )}
      {actionLabel && onAction && (
        <Button variant="contained" color="primary" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </Box>
  );
};

export default EmptyState;
