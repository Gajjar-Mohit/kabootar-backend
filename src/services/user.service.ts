import { User } from "../db/models/users";
import { CustomError } from "../utils/error-handler";

export const createUserSerivce = async (
  name: string,
  email: string,
  phone: string,
  profileUrl: string,
  bio: string,
  publickey: string
) => {
  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      throw new CustomError("User already exists", 400);
    }

    const user = await User.insertOne({
      name,
      email,
      phone,
      profileUrl,
      bio,
      publickey,
    });

    return user;
  } catch (error) {
    console.error(error);
    throw new CustomError(String(error), 500);
  }
};

export const getUserByIdService = async (customId: string) => {
  try {
    console.log("Custom UserId: " + customId);
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
    const user = await User.findOne({ _id: id });
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
