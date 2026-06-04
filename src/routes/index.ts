import { Router } from "express";
import notifyRouter from "./notifyRouter";

const routes = Router();

routes.use("/notify", notifyRouter);

export default routes;
