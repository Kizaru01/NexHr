import { Schema, models, model, Document } from "mongoose";
export interface IUser {
  email: string;
  image?: string;
  role?: "admin" | "hr" | "employee";
  provider: string;
  providerId?: string;
  isActive: boolean;
  lastLogin?: Date;
  notification?: {
    leave: boolean;
    attendance: boolean;
    announcements: boolean;
    payroll: boolean;
    email: boolean;
  };
}

export interface IUserDoc extends IUser, Document {}

const UserSchema = new Schema<IUser>(
  {
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
      default: true,
    },
    lastLogin: Date,
    notification: {
      leave: { type: Boolean, default: true },
      attendance: { type: Boolean, default: true },
      announcements: { type: Boolean, default: true },
      payroll: { type: Boolean, default: true },
      email: { type: Boolean, default: true },
    },
  },
  {
    timestamps: true,
  }
);

const User = models?.User || model<IUser>("User", UserSchema);
export default User;
