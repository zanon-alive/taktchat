import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  Button
} from "@mui/material";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";
import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import toastError from "../../errors/toastError";

const KanbanStats = () => {
  const [lanes, setLanes] = useState([]);
  const [loading, setLoading] = useState(true);
  const history = useHistory();

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get("/ticket/kanban/stats");
        setLanes(data?.lanes || []);
      } catch (err) {
        toastError(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <MainContainer>
      <MainHeader>
        <Title>{i18n.t("kanbanStats.title")}</Title>
        <MainHeaderButtonsWrapper>
          <Button variant="outlined" onClick={() => history.push("/kanban")}>
            {i18n.t("kanbanStats.openBoard")}
          </Button>
        </MainHeaderButtonsWrapper>
      </MainHeader>
      <Paper variant="outlined" style={{ padding: 16, margin: 16 }}>
        {!loading && lanes.length === 0 && (
          <Typography>{i18n.t("kanbanStats.empty")}</Typography>
        )}
        {lanes.length > 0 && (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>{i18n.t("kanbanStats.lane")}</TableCell>
                <TableCell align="right">{i18n.t("kanbanStats.count")}</TableCell>
                <TableCell align="right">{i18n.t("kanbanStats.avgAge")}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {lanes.map((lane) => (
                <TableRow key={lane.tagId}>
                  <TableCell>{lane.name}</TableCell>
                  <TableCell align="right">{lane.count}</TableCell>
                  <TableCell align="right">{lane.avgAgeHours}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>
    </MainContainer>
  );
};

export default KanbanStats;
