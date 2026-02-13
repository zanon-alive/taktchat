import express from "express";
import isAuth from "../middleware/isAuth";
import * as LicenseController from "../controllers/LicenseController";

const licenseRoutes = express.Router();

licenseRoutes.get("/licenses", isAuth, LicenseController.index);
licenseRoutes.get("/licenses/list", isAuth, LicenseController.list);
licenseRoutes.get("/licenses/:id", isAuth, LicenseController.show);
licenseRoutes.post("/licenses", isAuth, LicenseController.store);
licenseRoutes.put("/licenses/:id", isAuth, LicenseController.update);
licenseRoutes.post("/licenses/:id/register-payment", isAuth, LicenseController.registerPayment);
licenseRoutes.delete("/licenses/:id", isAuth, LicenseController.remove);

export default licenseRoutes;
