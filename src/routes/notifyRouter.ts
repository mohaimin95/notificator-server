import { NotifyController } from "@controllers";
import { Router } from "express";
import {
  validateRequestMiddleware,
  verifySecretMiddleware,
} from "@middlewares";
import { messageSchema } from "@schemas";

const notifyRouter = Router();

notifyRouter.get("/health", NotifyController.healthCheck);
notifyRouter.post(
  "/",
  verifySecretMiddleware,
  validateRequestMiddleware({
    body: messageSchema,
  }),
  NotifyController.notify,
);

export default notifyRouter;
