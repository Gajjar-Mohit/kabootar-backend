import type { Request, Response, NextFunction } from "express";
import { MessageRequest } from "../types/chat.type";
import {
  getMessagesByUserIdService,
  messageService,
} from "../services/chat.service";
import { CustomError } from "../utils/error-handler";
import { success } from "zod";

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

export const getMessagesByUserIdController = async (
  req: Request,
  res: Response
) => {
  const { id } = req.params;

  if (!id) {
    res.status(400).json({
      success: false,
      error: "UserId is required",
    });
    return;
  }

  try {
    const messages = await getMessagesByUserIdService(id);
    if (!messages) {
      res.status(404).json({
        success: false,
        message: "No Messages found",
        error: "Empty",
      });
    }
    res.status(200).json({
      success: true,
      messages: "Messages fetched successfully",
      data: messages,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: "Internal server error",
    });
  }
};
