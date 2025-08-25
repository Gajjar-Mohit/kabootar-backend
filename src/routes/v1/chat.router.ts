import { Router } from "express";
import { asyncHandler } from "../../utils/route-wrapper";
import { getMessagesByUserIdController, messageController } from "../../controllers/chat.controller";

const chatRouter = Router();

chatRouter.post("/message", asyncHandler(messageController));
chatRouter.get("/:id", asyncHandler(getMessagesByUserIdController))

export default chatRouter;
