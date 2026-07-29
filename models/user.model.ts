import { Schema, models, model, Document } from "mongoose";
export interface IUser {
  email: string;
  image?: string;
  role?: "admin" | "hr" | "employee";
  provider: string;
  providerId?: string;
  isActive: boolean;
  activationIssuedAt?: Date;
  activationTokenId?: string;
  activationTokenExpiresAt?: Date;
  activatedAt?: Date;
  welcomeEmailStatus?: "failed" | "sent";
  welcomeEmailSentAt?: Date;
  welcomeEmailLastAttemptAt?: Date;
  welcomeEmailRetryLockedUntil?: Date;
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
    activationIssuedAt: {
      type: Date,
      select: false,
    },
    activationTokenId: {
      type: String,
      select: false,
    },
    activationTokenExpiresAt: {
      type: Date,
      select: false,
    },
    activatedAt: Date,
    welcomeEmailStatus: {
      type: String,
      enum: ["failed", "sent"],
    },
    welcomeEmailSentAt: Date,
    welcomeEmailLastAttemptAt: Date,
    welcomeEmailRetryLockedUntil: {
      type: Date,
      select: false,
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
