import { NotifyController } from "@controllers";
import { Router } from "express";
import { validateRequestMiddleware } from "@middlewares";
import { messageSchema } from "@schemas";

const notifyRouter = Router();

notifyRouter.get("/health", NotifyController.healthCheck);
notifyRouter.post(
  "/",
  validateRequestMiddleware({
    body: messageSchema,
  }),
  NotifyController.notify,
);

export default notifyRouter;
