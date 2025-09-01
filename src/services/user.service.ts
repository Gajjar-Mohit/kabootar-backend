import { User, type IUser } from "../db/models/users";
import { CustomError } from "../utils/error-handler";

export const createUserSerivce = async (
  name: string,
  email: string,
  phone: string,
  profileUrl: string,
  bio: string,
  clerkId: string
) => {
  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return;
    }
    const user = await User.insertOne({
      name,
      email,
      phone,
      profileUrl,
      bio,
      clerkId,
    });

    return user;
  } catch (error) {
    console.error(error);
    throw new CustomError(String(error), 500);
  }
};

export const getUserByClerkIdService = async (customId: string) => {
  try {
    // console.log("Custom UserId: " + customId);
    const user = await User.findOne({ clerkId: customId });
    console.log(user);
    return user;
  } catch (error) {
    console.error(error);
    throw new CustomError(String(error), 500);
  }
};

export const getUserByIdService = async (customId: string) => {
  try {
    // console.log("Custom UserId: " + customId);
    const user = await User.findOne({ _id: customId });
    console.log(user);
    return user;
  } catch (error) {
    console.error(error);
    throw new CustomError(String(error), 500);
  }
};

export const deleteUserService = async (id: string) => {
  try {
    const user = await User.findOne({ clerkId: id });
    if (!user) {
      throw new CustomError("User not found", 404);
    }
    await User.deleteOne({ id });

    return user;
  } catch (error) {
    console.error(error);
    throw new CustomError(String(error), 500);
  }
};

export const searchUserService = async (
  searchTerm: string,
  excludeUserId: string
) => {
  console.log("Searching for user");
  console.log(searchTerm);
  try {
    // Validate inputs
    if (
      !searchTerm ||
      typeof searchTerm !== "string" ||
      searchTerm.trim() === ""
    ) {
      throw new CustomError("Search term is required", 400);
    }

    if (!excludeUserId || typeof excludeUserId !== "string") {
      throw new CustomError("Exclude user ID is required", 400);
    }

    // Search for users with case-insensitive partial match on name
    // Exclude the user with the provided excludeUserId
    const users = await User.find({
      name: { $regex: searchTerm.trim(), $options: "i" },
      _id: { $ne: excludeUserId },
    })
      .select("_id name email profileUrl bio") // Select only required fields
      .lean(); // Convert to plain JavaScript objects for better performance

    if (!users || users.length === 0) {
      throw new CustomError("No users found", 404);
    }

    // Format response to match the expected structure
    return {
      success: true,
      data: users.map((user: IUser) => ({
        _id: user._id,
        name: user.name,
        email: user.email,
        profileUrl: user.profileUrl || "",
        bio: user.bio || "",
      })),
    };
  } catch (error: any) {
    console.error("Error in searchUserService:", error);
    if (error instanceof CustomError) {
      throw error;
    }
    throw new CustomError(error.message || "Failed to search users", 500);
  }
};
