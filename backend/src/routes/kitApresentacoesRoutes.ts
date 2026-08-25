import { Router } from "express";
import isAuth from "../middleware/isAuth";
import * as KitApresentacoesController from "../controllers/KitApresentacoesController";

const kitApresentacoesRoutes = Router();

kitApresentacoesRoutes.get(
  "/kit-apresentacoes/:file",
  isAuth,
  KitApresentacoesController.show
);

export default kitApresentacoesRoutes;
