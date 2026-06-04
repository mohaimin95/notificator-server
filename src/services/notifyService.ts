import { randomUUID } from "node:crypto";
import { BroadcastMessage, MessageRequest } from "@schemas";
import { emitNotification, getConnectedClientCount } from "../socket";

export default class NotifyService {
  static health() {
    return {
      ok: true,
      clients: getConnectedClientCount(),
    };
  }

  static notify(notifyRequest: MessageRequest): BroadcastMessage {
    const notification = {
      id: randomUUID(),
      timestamp: new Date().toISOString(),
      ...notifyRequest,
    };

    emitNotification(notification);
    return notification;
  }
}
