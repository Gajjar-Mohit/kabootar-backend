import { Message, type IMessage } from "../db/models/messages";
import type { IUser } from "../db/models/users";
import { CustomError } from "../utils/error-handler";
import { getUserByClerkIdService, getUserByIdService } from "./user.service";

export const messageService = async (
  text: string,
  sender: string,
  recipient: string,
  messageType: string
) => {
  if (!text) {
    throw new CustomError("Message text is required", 400);
  }
  if (!sender) {
    throw new CustomError("Message sender is required", 400);
  }

  if (!recipient) {
    throw new CustomError("Message recipient is required", 400);
  }
  if (!messageType) {
    throw new CustomError("Message messageType is required", 400);
  }
  try {
    console.log({ text, sender, recipient, messageType });
    const senderExists = await getUserByIdService(sender);
    const recipientExists = await getUserByIdService(recipient);
    if (!senderExists) {
      throw new CustomError("Sender does not exist", 400);
    }

    if (!recipientExists) {
      throw new CustomError("Recipient does not exist", 400);
    }
    const message = Message.insertOne({
      text,
      sender: senderExists,
      recipient: recipientExists,
      read: false,
      delivered: false,
      createdAt: Date.now(),
      messageType: messageType,
    });
    return message;
  } catch (error) {
    console.log(error);
    throw new CustomError(String(error));
  }
};

export const getMessagesByUserIdAndRecipientId = async (
  userId: string,
  otherPerson: string
) => {
  console.log(`Other person id: ${otherPerson}`);
  console.log(`My id: ${userId}`);

  if (!userId) {
    throw new CustomError("UserId is required", 400);
  }

  try {
    const messages = await Message.find({
      $or: [
        {
          sender: userId,
          recipient: otherPerson,
        },
        {
          sender: otherPerson,
          recipient: userId,
        },
      ],
    }).sort({ createdAt: 1 });

    return messages.map((value) => {
      return {
        id: value._id,
        sender:  value.sender._id,
        recipient:  value.recipient._id,
        text: value.text,
        read: value.read,
        time: value.createdAt,
        delivered: value.delivered,
      };
    });
  } catch (error) {
    console.log(error);
    throw new CustomError(String(error), 500);
  }
};
interface ConversationType {
  userId: string;
  user: any;
  lastMessage: any;
}

export const getConversationsByUserId = async (
  userId: string
): Promise<ConversationType[]> => {
  console.log(userId);
  if (!userId) {
    throw new CustomError("UserId is required", 400);
  }

  try {
    const messages = await Message.find({
      $or: [{ sender: userId }, { recipient: userId }],
    })
      .populate("sender", "_id name email profileUrl bio online")
      .populate("recipient", "_id name email profileUrl bio online")
      .sort({ createdAt: -1 })
      .lean<IMessage[]>();

    const conversationsMap = new Map<string, boolean>();
    const conversations: ConversationType[] = [];

    messages.forEach((message) => {
      let otherPersonId: string;
      let otherPerson: IUser;

      const senderPopulated = message.sender as IUser;
      const recipientPopulated = message.recipient as IUser;

      if (senderPopulated._id?.toString() === userId) {
        otherPersonId = recipientPopulated._id?.toString() || "";
        otherPerson = recipientPopulated;
      } else {
        otherPersonId = senderPopulated._id?.toString() || "";
        otherPerson = senderPopulated;
      }

      if (
        otherPersonId &&
        otherPerson &&
        !conversationsMap.has(otherPersonId)
      ) {
        conversationsMap.set(otherPersonId, true);
        conversations.push({
          userId: otherPersonId,
          user: otherPerson,
          lastMessage: message,
        });
      }
    });

    return conversations;
  } catch (error) {
    console.log(error);
    throw new CustomError(String(error), 500);
  }
};
