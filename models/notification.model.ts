import { Document, model, models, Schema } from "mongoose";

export interface INotification {
  recipient: Schema.Types.ObjectId;
  type:
    | "Leave Approved"
    | "Leave Rejected"
    | "Attendance Correction Approved"
    | "New Announcement"
    | "Payslip Available"
    | "Concern Submitted"
    | "Concern Status Changed"
    | "Concern Resolved";
  title: string;
  description: string;
  href?: string;
  isRead: boolean;
  entityType?: "Concern";
  entityId?: Schema.Types.ObjectId;
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
        "Concern Submitted",
        "Concern Status Changed",
        "Concern Resolved",
      ],
      required: true,
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    href: String,
    isRead: { type: Boolean, default: false },
    entityType: { type: String, enum: ["Concern"] },
    entityId: { type: Schema.Types.ObjectId },
  },
  { timestamps: true }
);

NotificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
NotificationSchema.index({
  recipient: 1,
  entityType: 1,
  entityId: 1,
  isRead: 1,
});

const Notification =
  models?.Notification || model<INotificationDoc>("Notification", NotificationSchema);

export default Notification;
