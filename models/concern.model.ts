import { Document, model, models, Schema } from "mongoose";

import {
  CONCERN_CATEGORIES,
  CONCERN_PRIORITIES,
  CONCERN_STATUSES,
  type ConcernCategory,
  type ConcernPriority,
  type ConcernStatus,
} from "@/constants/concerns";

export interface IConcern {
  caseNumber: string;
  employee: Schema.Types.ObjectId;
  submittedBy: Schema.Types.ObjectId;
  subject: string;
  message: string;
  category: ConcernCategory;
  priority: ConcernPriority;
  status: ConcernStatus;
  attachmentCount: number;
  lastActivityAt: Date;
  viewedAt?: Date;
  resolvedAt?: Date;
  closedAt?: Date;
  isArchived: boolean;
  archivedAt?: Date;
  archivedBy?: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IConcernDoc extends IConcern, Document {}

const ConcernSchema = new Schema<IConcernDoc>(
  {
    caseNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      immutable: true,
    },
    employee: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
      immutable: true,
    },
    submittedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      immutable: true,
    },
    subject: { type: String, required: true, trim: true, maxlength: 140 },
    message: { type: String, required: true, trim: true, maxlength: 5_000 },
    category: {
      type: String,
      enum: CONCERN_CATEGORIES,
      required: true,
    },
    priority: {
      type: String,
      enum: CONCERN_PRIORITIES,
      required: true,
      default: "Medium",
    },
    status: {
      type: String,
      enum: CONCERN_STATUSES,
      required: true,
      default: "New",
    },
    attachmentCount: { type: Number, default: 0, min: 0 },
    lastActivityAt: { type: Date, required: true, default: Date.now },
    viewedAt: Date,
    resolvedAt: Date,
    closedAt: Date,
    isArchived: { type: Boolean, default: false },
    archivedAt: Date,
    archivedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

ConcernSchema.index({ employee: 1, isArchived: 1, lastActivityAt: -1 });
ConcernSchema.index({
  isArchived: 1,
  status: 1,
  priority: 1,
  lastActivityAt: -1,
});
ConcernSchema.index({ subject: "text", caseNumber: "text" });

const Concern =
  models?.Concern || model<IConcernDoc>("Concern", ConcernSchema);

export default Concern;
