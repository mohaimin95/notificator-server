import Redis from "ioredis";

const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
  throw new Error("REDIS_URL environment variable is required");
}

const parsedRedisUrl = new URL(redisUrl);

if (!["redis:", "rediss:"].includes(parsedRedisUrl.protocol)) {
  throw new Error("REDIS_URL must use redis:// or rediss://");
}

const redisClient = new Redis(redisUrl, {
  password: process.env.REDIS_PASSWORD,
  username: process.env.REDIS_USERNAME,
  enableOfflineQueue: false,
  lazyConnect: true,
  maxRetriesPerRequest: 3,
  retryStrategy: (retryCount) => {
    return retryCount <= 3 ? Math.min(250 * 2 ** (retryCount - 1), 2000) : null;
  },
});

redisClient.on("error", (error: Error) => {
  // eslint-disable-next-line no-console
  console.error("Redis client error:", error);
});

export const connectRedis = async (): Promise<Redis> => {
  if (redisClient.status === "ready") {
    return redisClient;
  }

  try {
    if (redisClient.status === "wait") {
      await redisClient.connect();
    }

    await redisClient.ping();
    return redisClient;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    throw new Error(
      [
        `Unable to connect to Redis at ${parsedRedisUrl.hostname}.`,
        message,
        "Check that the app can reach the Redis endpoint and TLS matches the URL scheme.",
      ].join(" "),
    );
  }
};

export const getRedisClient = (): Redis => {
  if (redisClient.status !== "ready") {
    throw new Error("Redis client is not connected");
  }

  return redisClient;
};

export const disconnectRedis = async (): Promise<void> => {
  if (redisClient.status !== "end") {
    await redisClient.quit();
  }
};
