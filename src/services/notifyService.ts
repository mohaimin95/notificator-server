import { randomUUID } from "node:crypto";
import { BroadcastMessage, MessageRequest } from "@schemas";
import { emitNotification, getConnectedClientCount } from "../socket";
import MessageStoreService from "./messageStoreService";

export default class NotifyService {
  static health() {
    return {
      ok: true,
      clients: getConnectedClientCount(),
    };
  }

  static async notify(
    notifyRequest: MessageRequest,
  ): Promise<BroadcastMessage & { deliveryId: string }> {
    const notification: BroadcastMessage = {
      id: randomUUID(),
      timestamp: new Date().toISOString(),
      ...notifyRequest,
    };

    const storedMessage = await MessageStoreService.store(notification);
    const deliveredMessage = {
      ...storedMessage.message,
      deliveryId: storedMessage.deliveryId,
    };

    emitNotification(deliveredMessage);
    return deliveredMessage;
  }
}
