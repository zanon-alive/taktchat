import express from "express";
import isAuth from "../middleware/isAuth";

import * as DashboardController from "../controllers/DashbardController";

const routes = express.Router();

routes.get("/dashboard", isAuth, DashboardController.index);
routes.get("/dashboard/summary", isAuth, DashboardController.summary);
routes.get("/dashboard/partner-billing-report", isAuth, DashboardController.partnerBillingReport);
routes.post("/dashboard/partner-billing-report/calculate", isAuth, DashboardController.partnerBillingCalculate);
routes.get("/dashboard/partner-billing-snapshots", isAuth, DashboardController.partnerBillingSnapshots);
routes.get("/dashboard/ticketsUsers", DashboardController.reportsUsers);
routes.get("/dashboard/ticketsDay", DashboardController.reportsDay);
routes.get("/dashboard/moments",isAuth, DashboardController.DashTicketsQueues);

export default routes;
