import "./pre-start";
import { createServer } from "http";
import app from "./src/app";
import { initSocket } from "./src/socket";
import { connectRedis } from "./src/redis";

const server = createServer(app);

const startServer = async (): Promise<void> => {
  try {
    await connectRedis();

    // eslint-disable-next-line no-console
    console.log("Redis connected successfully");

    initSocket(server);
    server.listen(process.env.PORT, () => {
      // eslint-disable-next-line no-console
      console.log("APP started listening on PORT", process.env.PORT);
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Failed to connect to Redis:", error);
    process.exit(1);
  }
};

void startServer();
