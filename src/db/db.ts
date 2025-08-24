import { MongoClient } from "mongodb";
const client = new MongoClient(process.env.DATABASE_URL!);

export const connect = async () => {
  try {
    await client.connect();
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    process.exit(1);
  }
};

export const disconnect = async () => {
  try {
    await client.close();
    console.log("Disconnected from MongoDB");
  } catch (error) {
    console.error("Failed to disconnect from MongoDB:", error);
    process.exit(1);
  }
};

export const getDb = async () => {
  await connect();
  return client.db(process.env.DATABASE_NAME!);
};
