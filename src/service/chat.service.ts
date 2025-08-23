import { Context } from 'hono';
import { MessageType } from '../types/user';
import { AppError } from '../utils/errors';
import { getPrisma } from '../db';

export class ChatService {
	async message(message: MessageType, c: Context<{ Bindings: Env }>) {
		const prisma = getPrisma(c.env.DATABASE_URL!);
		try {
			if (!message.conversationId) {
				const newConversation = await prisma.conversation.create({
					data: {},
				});
				message.conversationId = newConversation.id;
			}
			const newMessage = await prisma.message.create({
				data: {
					text: message.message,
					senderId: message.senderId,
					conversationId: message.conversationId,
					recipientId: message.recipientId,
				},
			});
			return newMessage;
		} catch (error) {
			console.log(error);
			throw new AppError('Failed to send message', 500, 'DATABASE_ERROR');
		}
	}

	async getConversationById(id: string, c: Context<{ Bindings: Env }>) {
		try {
			const prisma = getPrisma(c.env.DATABASE_URL!);
			const conversation = await prisma.conversation.findUnique({
				where: {
					id,
				},
				include: {
					messages: true,
					conversationUsers: true,
				},
			});
			return conversation;
		} catch (error) {
			throw new AppError('Failed to fetch conversation', 500, 'DATABASE_ERROR');
		}
	}
}
