import z from "zod";

export const MessageRequest = z.object({
  text: z.string(),
  sender: z.string(),
  recipient: z.string(),
  messageType: z.enum(["text", "image", "file", "audio"]),
});


