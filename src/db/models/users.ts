import { Schema, model, Document, type ObjectId } from "mongoose";

// Interface extending Document for better TypeScript support
export interface IUser extends Document {
  name: string;
  email: string;
  phone?: string;
  profileUrl?: string;
  bio?: string;
  online?: boolean;
  publickey: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Schema definition
const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email address",
      ],
      index: true,
    },
    phone: {
      type: String,
      trim: true,
      validate: {
        validator: function (v: string) {
          return !v || /^\+?[\d\s\-\(\)]+$/.test(v);
        },
        message: "Please enter a valid phone number",
      },
    },
    profileUrl: {
      type: String,
      trim: true,
      validate: {
        validator: function (v: string) {
          return !v || /^https?:\/\/.+\..+/.test(v);
        },
        message: "Please enter a valid URL",
      },
    },
    bio: {
      type: String,
      trim: true,
      maxlength: [500, "Bio cannot exceed 500 characters"],
    },
    online: {
      type: Boolean,
      default: false,
      index: true,
    },
    publickey: {
      type: String,
      required: [true, "Public key is required"],
      unique: true,
      index: true,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
    versionKey: false, // Removes __v field
  }
);

// Add indexes for better query performance
UserSchema.index({ email: 1, id: 1 });
UserSchema.index({ online: 1, updatedAt: -1 });

// Export the model (with proper error handling for re-compilation)
export const User = model<IUser>("User", UserSchema);

export default UserSchema;
