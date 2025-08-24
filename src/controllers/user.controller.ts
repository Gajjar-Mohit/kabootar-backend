import { getDb } from "../db/db";
import type { Request, Response, NextFunction } from "express";
import { UserCreateRequest } from "../types/user.type";
import {
  createUserSerivce,
  deleteUserService,
  getUserByIdService,
} from "../services/user.service";
import { CustomError } from "../utils/error-handler";
import { success } from "zod";

export const createUserController = async (req: Request, res: Response) => {
  const parsedBody = UserCreateRequest.safeParse(req.body);
  if (parsedBody.success) {
    const { name, email, phone, profileUrl, bio } = parsedBody.data;
    try {
      const newUser = await createUserSerivce(
        name,
        email,
        phone || "",
        profileUrl || "",
        bio || ""
      );
      res.status(201).json({
        success: true,
        message: "User created successfully",
        data: newUser,
      });
    } catch (error) {
      console.error(error);
      if (error instanceof CustomError) {
        res.status(400).json({
          success: false,
          message: "Failed to create user",
          error: error.message,
        });
      }
    }
  } else {
    res.status(400).json({
      success: false,
      message: "Invalid request body",
      error: parsedBody.error,
    });
  }
};

export const getUserByIdController = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    res.status(400).json({
      success: false,
      error: "UserId is required",
    });
    return;
  }
  try {
    const user = await getUserByIdService(id);
    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
        error: "User not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "User found",
      data: user,
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

export const deleteUserController = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    res.status(400).json({
      success: false,
      error: "UserId is required",
    });
    return;
  }
  try {
    const user = await deleteUserService(id);
    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
        error: "User not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "User deleted",
      data: user,
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
