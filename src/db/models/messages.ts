import { Schema, model, Document, Types, type ObjectId } from "mongoose";
import type { IUser } from "./users";

// Interface extending Document for better TypeScript support
export interface IMessage extends Document {
  text: string;
  sender: Types.ObjectId | IUser;
  recipient: Types.ObjectId | IUser;
  read: boolean;
  delivered: boolean;
  messageType?: "text" | "image" | "file" | "audio";
  createdAt?: Date;
}

// Schema definition
const MessageSchema = new Schema<IMessage>(
  {
    text: {
      type: String,
      required: [true, "Message text is required"],
      trim: true,
      maxlength: [5000, "Message cannot exceed 5000 characters"],
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Sender is required"],
      index: true,
    },
    recipient: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Recipient is required"],
      index: true,
    },
    read: {
      type: Boolean,
      default: false,
      index: true,
    },
    delivered: {
      type: Boolean,
      default: false,
      index: true,
    },
    messageType: {
      type: String,
      enum: ["text", "image", "file", "audio"],
      default: "text",
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
    versionKey: false, // Removes __v field
  }
);

// Compound indexes for better query performance
MessageSchema.index({ sender: 1, recipient: 1, timestamp: -1 });
MessageSchema.index({ recipient: 1, read: 1, timestamp: -1 });
MessageSchema.index({ sender: 1, timestamp: -1 });
MessageSchema.index({ delivered: 1, timestamp: 1 });

// Export the model
export const Message = model<IMessage>("Message", MessageSchema);

export default MessageSchema;
