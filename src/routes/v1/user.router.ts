import { Router } from "express";
import { UserCreateRequest } from "../../types/user.type";
import { getDb } from "../../db/db";
import { asyncHandler } from "../../utils/route-wrapper";
import { createUserController, deleteUserController,  getUserByIdController } from "../../controllers/user.controller";

const userRouter = Router();

userRouter.post("/create", asyncHandler(createUserController));
userRouter.get("/:id", asyncHandler(getUserByIdController));
userRouter.delete("/:id", asyncHandler(deleteUserController));

export default userRouter;
