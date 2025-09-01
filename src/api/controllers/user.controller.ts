import type { Request, Response } from "express";

import { CustomError } from "../../utils/error-handler";
import { Webhook } from "svix";
import { User } from "../../db/models/users";
import {
  createUserSerivce,
  getUserByClerkIdService,
  deleteUserService,
  searchUserService,
} from "../../services/user.service";

export const createUserController = async (req: Request, res: Response) => {
  console.log("Webhook received:", req.body);
  const secret = process.env.CLERK_WEBHOOK_SECRET;
  if (!secret) {
    return new Response("No secret found", {
      status: 500,
    });
  }

  const webhook = new Webhook(secret);

  const svix_id = req.get("svix-id");
  const svix_timestamp = req.get("svix-timestamp");
  const svix_signature = req.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error occured -- no svix headers", {
      status: 400,
    });
  }

  const body = JSON.stringify(req.body);
  let evt: any;

  try {
    evt = webhook.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    });

    if (evt.type == "user.created") {
      try {
        const exists = await User.findOne({ clerkId: evt.data.id });
        if (exists) {
          res.status(400).json({
            success: false,
            error: "User already exists",
          });
          return;
        }

        const newUser = await createUserSerivce(
          evt.data.first_name + " " + evt.data.last_name,
          evt.data.email_addresses[0].email_address,
          "",
          evt.data.image_url,
          "",
          evt.data.id
        );
        res.status(201).json({
          success: true,
          message: "User created successfully",
          data: newUser,
        });
        // const res = await registerUserService({
        //   name: evt.data.first_name + " " + evt.data.last_name,
        //   email: evt.data.email_addresses[0].email_address,
        //   role: "USER",
        //   imageUrl: evt.data.image_url,
        //   clerkId: evt.data.id,
        // });
        // console.log(res);
      } catch (error) {
        console.log(error);
        return new Response("Error creating user", {
          status: 500,
        });
      }
    }

    // if (evt.type == "user.deleted") {
    //   try {
    //     const res = await deleteUserService(evt.data.id || "");
    //     console.log(res);
    //   } catch (error) {
    //     console.log(error);
    //     return new Response("Error deleting user", {
    //       status: 500,
    //     });
    //   }
    // }

    // if (evt.type == "user.updated") {
    //   // Handle user update logic here if needed
    // }

    // Return success response for all webhook events
    return new Response("Webhook processed successfully", {
      status: 200,
    });
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error occured", {
      status: 400,
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
    const user = await getUserByClerkIdService(id);
    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
        error: "User not found",
      });
      return;
    }
    res.status(200).json({
      success: true,
      message: "User found",
      data: user,
    });
    return;
  } catch (error) {
    console.error(error);

    res.status(400).json({
      success: false,
      message: "Internal server error",
      error: "Internal server error",
    });
    return;
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

export const searchUserController = async (req: Request, res: Response) => {
  // Check if headers are already sent (for debugging)
  console.log(req.query);
  console.log("Searching for user");

  try {
    const { q: searchTerm, exclude: excludeUserId } = req.query;

    // Validate searchTerm
    if (!searchTerm || typeof searchTerm !== "string") {
      console.log("Invalid search term:", searchTerm);
      return res.status(400).json({
        success: false,
        error: "Search term is required",
      });
    }

    // Validate excludeUserId
    if (!excludeUserId || typeof excludeUserId !== "string") {
      console.log("Invalid exclude user ID:", excludeUserId);
      return res.status(400).json({
        success: false,
        error: "Exclude user ID is required",
      });
    }

    // Call the service with both parameters
    console.log("Calling searchUserService with:", {
      searchTerm,
      excludeUserId,
    });
    const result = await searchUserService(searchTerm, excludeUserId);

    // Ensure headers are not sent yet
    if (res.headersSent) {
      console.error(
        "Headers sent unexpectedly before sending success response"
      );
      return;
    }

    // Return success response
    return res.status(200).json({
      success: true,
      data: result.data,
    });
  } catch (error: any) {
    console.error("Error in searchUserController:", error);

    // Prevent sending response if headers are already sent
    if (res.headersSent) {
      console.error("Headers already sent when handling error");
      return;
    }

    // Handle CustomError from service
    if (error instanceof CustomError) {
      return res.status(error.statusCode).json({
        success: false,
        error: error.message,
      });
    }

    // Handle unexpected errors
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};
