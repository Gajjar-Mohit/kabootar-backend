import { Router } from "express";
import userRouter from "./v1/user.router";

const router = Router();

router.get("/user", userRouter);

export default router;
