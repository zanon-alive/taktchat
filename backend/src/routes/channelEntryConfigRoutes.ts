import express from "express";
import isAuth from "../middleware/isAuth";
import * as ChannelEntryConfigController from "../controllers/ChannelEntryConfigController";

const channelEntryConfigRoutes = express.Router();

channelEntryConfigRoutes.get("/channelEntryConfigs", isAuth, ChannelEntryConfigController.index);
channelEntryConfigRoutes.put("/channelEntryConfigs", isAuth, ChannelEntryConfigController.update);

export default channelEntryConfigRoutes;
