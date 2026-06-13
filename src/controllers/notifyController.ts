import { NotifyService } from "@services";
import { Request, Response } from "express";

export default class NotifyController {
  static healthCheck(_req: Request, res: Response): void {
    const message = NotifyService.health();
    res.status(200).send(message);
  }

  static async notify(req: Request, res: Response): Promise<void> {
    const message = await NotifyService.notify(req.body);
    res.status(202).send(message);
  }
}
