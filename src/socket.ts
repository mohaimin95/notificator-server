import { Server as HttpServer } from "http";
import { Server as SocketServer } from "socket.io";
import MessageStoreService from "./services/messageStoreService";

let io: SocketServer | undefined;
const DEVICE_ID_HEADER = "deviceid";

const getDeviceId = (
  value: string | string[] | undefined,
): string | undefined => {
  if (Array.isArray(value)) {
    value = value[0];
  }

  if (typeof value !== "string") {
    return undefined;
  }

  const deviceId = value.trim();
  return deviceId.length > 0 && deviceId.length <= 128 ? deviceId : undefined;
};

export const initSocket = (server: HttpServer): SocketServer => {
  io = new SocketServer(server, {
    cors: {
      allowedHeaders: ["DeviceId"],
      origin: "*",
    },
  });

  io.use((socket, next) => {
    const deviceId = getDeviceId(socket.handshake.headers[DEVICE_ID_HEADER]);

    if (!deviceId) {
      next(new Error("A stable DeviceId header is required"));
      return;
    }

    socket.data.deviceId = deviceId;
    next();
  });

  io.on("connection", async (socket) => {
    const deviceId = socket.data.deviceId as string;

    socket.on("message:ack", async (deliveryId: unknown) => {
      if (typeof deliveryId !== "string") {
        return;
      }

      try {
        await MessageStoreService.acknowledge(deviceId, deliveryId);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Failed to acknowledge Redis message:", error);
      }
    });

    try {
      const missedMessages = await MessageStoreService.getMissed(deviceId);

      missedMessages.forEach(({ deliveryId, message }) => {
        socket.emit("message", {
          ...message,
          deliveryId,
        });
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Failed to retrieve missed Redis messages:", error);
    }
  });

  return io;
};

export const emitNotification = <TPayload>(payload: TPayload): void => {
  io?.emit("message", payload);
};

export const getConnectedClientCount = (): number => {
  return io?.engine.clientsCount ?? 0;
};
