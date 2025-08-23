import { Hono } from 'hono';
import { createErrorResponse, createResponse } from '../../utils/response';
import { ChatService } from '../../service/chat.service';
import { MessageSchema } from '../../schema/chat';
import { AppError } from '../../utils/errors';

const chatRouter = new Hono<{ Bindings: Env }>();

chatRouter.get('/message', async (c) => {
	const body = await c.req.json();
	console.log(body);
	const parsedBody = MessageSchema.safeParse(body);
	if (!parsedBody.success) {
		return c.json(createErrorResponse(parsedBody.error.message, 400));
	}
	const chatService = new ChatService();

	const message = await chatService.message(
		{
			message: parsedBody.data.message,
			senderId: parsedBody.data.senderId,
			recipientId: parsedBody.data.recipientId,
			conversationId: parsedBody.data.conversationId,
		},
		c
	);
	return c.json(createResponse(message, 'Message created successfully'));
});

chatRouter.get('/get/:id', async (c) => {
	const id = c.req.param('id');
	const chatService = new ChatService();
	if (!id) {
		throw new AppError('Conversation id is required', 400, 'INVALID_INPUT');
	}
	const conversation = await chatService.getConversationById(id, c);
	if (!conversation) {
		throw new AppError('Conversation not found', 404, 'CONVERSATION_NOT_FOUND');
	}

	return c.json(createResponse(conversation, 'Conversation fetched successfully'));
});

export { chatRouter };
