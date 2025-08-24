import { Router } from "express";
import { asyncHandler } from "../../utils/route-wrapper";
import { messageController } from "../../controllers/chat.controller";

const chatRouter = Router();

chatRouter.post("/message", asyncHandler(messageController));

export default chatRouter;
