import { Router } from "express";
import chatRouter from "./v1/chat.router";
import userRouter from "./v1/user.router";

const router = Router();

router.use("/user", userRouter);
router.use("/chat", chatRouter);

export default router;
