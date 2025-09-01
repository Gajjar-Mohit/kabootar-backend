import { Router } from "express";
import { asyncHandler } from "../../../utils/route-wrapper";
import {
  getConversationsByUserIdController,
  getMessagesByUserIdController,
} from "../../controllers/chat.controller";

const chatRouter = Router();

// chatRouter.post("/message", asyncHandler(messageController));
chatRouter.post("/messages", asyncHandler(getMessagesByUserIdController));
chatRouter.get(
  "/conversations/:id",
  asyncHandler(getConversationsByUserIdController)
);

export default chatRouter;
