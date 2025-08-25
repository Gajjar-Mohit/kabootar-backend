import { Message } from "../db/models/messages";
import { User } from "../db/models/users";
import { CustomError } from "../utils/error-handler";
import { getUserByIdService } from "./user.service";

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

export const getMessagesByUserIdService = async (userId: string) => {
  console.log(userId);
  if (!userId) {
    throw new CustomError("UserId is required", 400);
  }

  try {
    const messages = await Message.find({
      $or: [
        {
          sender: {
            _id: userId,
          },
        },
        {
          recipient: {
            _id: userId,
          },
        },
      ],
    });

    return messages;
  } catch (error) {
    console.log(error);
    throw new CustomError(String(error), 500);
  }
};
