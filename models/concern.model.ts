import { Document, model, models, Schema } from "mongoose";

import {
  CONCERN_CATEGORIES,
  type ConcernCategory,
} from "@/constants/concerns";

export interface IConcern {
  caseNumber: string;
  employee: Schema.Types.ObjectId;
  submittedBy: Schema.Types.ObjectId;
  subject: string;
  message: string;
  category: ConcernCategory;
  attachmentCount: number;
  isViewed: boolean;
  viewedAt?: Date;
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
    attachmentCount: { type: Number, default: 0, min: 0 },
    isViewed: { type: Boolean, default: false },
    viewedAt: Date,
  },
  { timestamps: true }
);

ConcernSchema.index({ employee: 1, createdAt: -1 });
ConcernSchema.index({ isViewed: 1, createdAt: -1 });
ConcernSchema.index({ subject: "text", caseNumber: "text" });

const Concern =
  models?.Concern || model<IConcernDoc>("Concern", ConcernSchema);

export default Concern;
