export interface CreateUser {
	name: string;
	email?: string;
	phone?: string;
	publicKey: string;
}

export interface MessageType {
	senderId: string;
	message: string;
	conversationId: string;
	recipientId: string;
}
