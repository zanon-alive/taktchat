import React from "react";
import { useTheme, useMediaQuery } from "@mui/material";

import Tickets from "../TicketsCustom";
import TicketAdvanced from "../TicketsAdvanced";

function TicketResponsiveContainer() {
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));

  if (isMdUp) {
    return <Tickets />;
  }
  return <TicketAdvanced />;
}

export default TicketResponsiveContainer;