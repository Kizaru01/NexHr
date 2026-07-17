import { Document, model, models, Schema } from "mongoose";

export interface INotification {
  recipient: Schema.Types.ObjectId;
  type:
    | "Leave Approved"
    | "Leave Rejected"
    | "Attendance Correction Approved"
    | "New Announcement"
    | "Payslip Available";
  title: string;
  description: string;
  href?: string;
  isRead: boolean;
}

export interface INotificationDoc extends INotification, Document {}

const NotificationSchema = new Schema<INotificationDoc>(
  {
    recipient: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: [
        "Leave Approved",
        "Leave Rejected",
        "Attendance Correction Approved",
        "New Announcement",
        "Payslip Available",
      ],
      required: true,
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    href: String,
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

NotificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

const Notification =
  models?.Notification || model<INotificationDoc>("Notification", NotificationSchema);

export default Notification;
