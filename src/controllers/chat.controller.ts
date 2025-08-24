import type { Request, Response, NextFunction } from "express";
import { MessageRequest } from "../types/chat.type";
import { messageService } from "../services/chat.service";
import { CustomError } from "../utils/error-handler";

export const messageController = async (req: Request, res: Response) => {
  const parsedBody = MessageRequest.safeParse(req.body);
  if (parsedBody.success) {
    const { text, sender, recipient, messageType } = parsedBody.data;
    try {
      const message = await messageService(
        text,
        sender,
        recipient,
        messageType
      );
      res.status(201).json({
        success: true,
        message: "Message stored successfully",
        data: message,
      });
    } catch (error) {
      console.error(error);
      if (error instanceof CustomError) {
        res.status(400).json({
          success: false,
          message: "Failed to store message",
          error: error.message,
        });
      }
    }
  }
};
