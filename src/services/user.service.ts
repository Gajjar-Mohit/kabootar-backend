import { disconnect, getDb } from "../db/db";
import { CustomError } from "../utils/error-handler";
export const createUserSerivce = async (
  name: string,
  email: string,
  phone: string,
  profileUrl: string,
  bio: string
) => {
  try {
    const db = await getDb();
    const userExists = await db
      .collection("users")
      .findOne({ email: email.toLowerCase() });
    if (userExists) {
      throw new CustomError("User already exists", 400);
    }

    const user = await db.collection("users").insertOne({
      name,
      email,
      phone,
      profileUrl,
      bio,
    });
    await disconnect();
    return user;
  } catch (error) {
    console.error(error);
    throw new CustomError(String(error), 500);
  }
};

export const getUserByIdService = async (id: string) => {
  try {
    console.log("UseridL " + id);
    const db = await getDb();
    const user = await db.collection("users").findOne({ id });
    console.log(user);
    await disconnect();
    return user;
  } catch (error) {
    console.error(error);
    throw new CustomError(String(error), 500);
  }
};

export const deleteUserService = async (id: string) => {
  try {
    const db = await getDb();
    const user = await db.collection("users").findOne({ id });
    if (!user) {
      throw new CustomError("User not found", 404);
    }
    await db.collection("users").deleteOne({ id });
    await disconnect();
    return user;
  } catch (error) {
    console.error(error);
    throw new CustomError(String(error), 500);
  }
};
