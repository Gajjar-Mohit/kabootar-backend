import z from 'zod';

export const MessageSchema = z.object({
	senderId: z.string(),
	message: z.string(),
	conversationId: z.string(),
	recipientId: z.string(),
});
