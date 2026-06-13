import z4 from "zod/v4";

export const severities = [
  "normal",
  "success",
  "warn",
  "danger",
  "info",
  "disabled",
] as const;

export const messageSchema = z4.object({
  title: z4
    .string()
    .trim()
    .transform((title) => (title.length > 0 ? title : undefined))
    .optional(),
  message: z4.string().trim().min(1, "Message is required"),
  severity: z4.enum(severities).default("normal"),
  actions: z4.array(z4.tuple([z4.string(), z4.string()])).optional(),
});

export const broadcastMessageSchema = messageSchema.extend({
  id: z4.string().uuid(),
  timestamp: z4.iso.datetime(),
});

export type MessageSeverity = (typeof severities)[number];
export type MessageRequest = z4.infer<typeof messageSchema>;
export type BroadcastMessage = z4.infer<typeof broadcastMessageSchema>;
