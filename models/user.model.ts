import { Schema, models, model, Document } from "mongoose";
export interface IUser {
  name: string;
  email: string;
  image?: string;

  role?: "admin" | "hr" | "employee";
  provider: string;
  providerId: string;
  isActive: boolean;
  lastLogin?: Date;
}

export interface IUserDoc extends IUser, Document {}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    image: String,

    provider: {
      type: String,
      default: "google",
    },

    providerId: {
      type: String,
    },
    role: {
      type: String,
      enum: ["admin", "hr", "employee"],
      default: "employee",
    },

    isActive: {
      type: Boolean,
      default: false,
    },
    lastLogin: Date,
  },
  {
    timestamps: true,
  }
);

const User = models?.User || model<IUser>("User", UserSchema);
export default User;
