import { Server as HttpServer } from "http";
import { Server as SocketServer } from "socket.io";
import { randomUUID } from "node:crypto";

let io: SocketServer | undefined;

export const initSocket = (server: HttpServer): SocketServer => {
  io = new SocketServer(server, {
    cors: {
      origin: "*",
    },
  });

  io.on("connection", (socket) => {
    socket.emit("message", {
      id: randomUUID(),
      title: "Connected",
      message: "This device is listening for notifications.",
      severity: "success",
      actions: [["Close", "action::delete"]],
      timestamp: new Date().toISOString(),
    });
  });

  return io;
};

export const emitNotification = <TPayload>(payload: TPayload): void => {
  io?.emit("message", payload);
};

export const getConnectedClientCount = (): number => {
  return io?.engine.clientsCount ?? 0;
};
