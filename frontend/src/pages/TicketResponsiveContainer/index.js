import React from "react";
import { useTheme, useMediaQuery } from "@mui/material";

import Tickets from "../TicketsCustom";
import TicketAdvanced from "../TicketsAdvanced";
import { isStandaloneDisplay } from "../../utils/mobileInbox";

function TicketResponsiveContainer() {
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));

  if (isMdUp && !isStandaloneDisplay()) {
    return <Tickets />;
  }
  return <TicketAdvanced />;
}

export default TicketResponsiveContainer;