import { BroadcastMessage, broadcastMessageSchema } from "@schemas";
import { getRedisClient } from "../redis";

const MESSAGE_KEY_PREFIX = "notificator:message:";
const CLIENT_ACK_PREFIX = "notificator:client-ack:";
const MESSAGE_RETENTION_MS = 2 * 24 * 60 * 60 * 1000;
const DELIVERY_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type StoredMessage = {
  deliveryId: string;
  message: BroadcastMessage;
};

const getMessageKey = (deliveryId: string): string => {
  return `${MESSAGE_KEY_PREFIX}${deliveryId}`;
};

const getClientAckKey = (clientId: string, deliveryId: string): string => {
  return `${CLIENT_ACK_PREFIX}${clientId}:${deliveryId}`;
};

const parseStoredMessage = (value: string | null): StoredMessage | null => {
  if (!value) {
    return null;
  }

  try {
    const result = broadcastMessageSchema.safeParse(JSON.parse(value));

    return result.success
      ? { deliveryId: result.data.id, message: result.data }
      : null;
  } catch {
    return null;
  }
};

export default class MessageStoreService {
  static async store(message: BroadcastMessage): Promise<StoredMessage> {
    await getRedisClient().set(
      getMessageKey(message.id),
      JSON.stringify(message),
      "PX",
      MESSAGE_RETENTION_MS,
    );

    return {
      deliveryId: message.id,
      message,
    };
  }

  static async getMissed(clientId: string): Promise<StoredMessage[]> {
    const redisClient = getRedisClient();
    const messages: StoredMessage[] = [];
    let cursor = "0";

    do {
      const [nextCursor, keys] = await redisClient.scan(
        cursor,
        "MATCH",
        `${MESSAGE_KEY_PREFIX}*`,
        "COUNT",
        100,
      );
      cursor = nextCursor;

      if (keys.length === 0) {
        continue;
      }

      const values = await redisClient.mget(keys);
      const storedMessages = values.flatMap((value) => {
        const storedMessage = parseStoredMessage(
          value === null ? null : String(value),
        );
        return storedMessage ? [storedMessage] : [];
      });

      if (storedMessages.length === 0) {
        continue;
      }

      const acknowledgements = await redisClient.mget(
        storedMessages.map(({ deliveryId }) =>
          getClientAckKey(clientId, deliveryId),
        ),
      );

      storedMessages.forEach((storedMessage, index) => {
        if (!acknowledgements[index]) {
          messages.push(storedMessage);
        }
      });
    } while (cursor !== "0");

    return messages.sort(
      (left, right) =>
        Date.parse(left.message.timestamp) -
        Date.parse(right.message.timestamp),
    );
  }

  static async acknowledge(
    clientId: string,
    deliveryId: string,
  ): Promise<void> {
    if (!DELIVERY_ID_PATTERN.test(deliveryId)) {
      return;
    }

    await getRedisClient().set(
      getClientAckKey(clientId, deliveryId),
      "1",
      "PX",
      MESSAGE_RETENTION_MS,
    );
  }
}
