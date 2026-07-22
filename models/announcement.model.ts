import { Document, model, models, Schema } from "mongoose";

export interface IAnnouncement {
  title: string;
  description: string;
  category: "Company" | "People" | "Policy" | "Benefits" | "Events";
  priority: "Low" | "Normal" | "High";
  publishedAt: Date;
  isPublished: boolean;
  isArchived: boolean;
  archivedAt?: Date;
}

export interface IAnnouncementDoc extends IAnnouncement, Document {}

const AnnouncementSchema = new Schema<IAnnouncementDoc>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ["Company", "People", "Policy", "Benefits", "Events"],
      required: true,
    },
    priority: { type: String, enum: ["Low", "Normal", "High"], default: "Normal" },
    publishedAt: { type: Date, default: Date.now },
    isPublished: { type: Boolean, default: false },
    isArchived: { type: Boolean, default: false },
    archivedAt: Date,
  },
  { timestamps: true }
);

AnnouncementSchema.index({ isArchived: 1, isPublished: 1, publishedAt: -1 });

const Announcement =
  models?.Announcement || model<IAnnouncementDoc>("Announcement", AnnouncementSchema);

export default Announcement;
