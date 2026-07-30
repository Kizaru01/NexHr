import { Document, model, models, Schema } from "mongoose";

import {
  CONCERN_STATUSES,
  type ConcernStatus,
} from "@/constants/concerns";

export interface IConcernStatusHistory {
  concern: Schema.Types.ObjectId;
  from?: ConcernStatus;
  to: ConcernStatus;
  changedBy: Schema.Types.ObjectId;
  reason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IConcernStatusHistoryDoc
  extends IConcernStatusHistory,
    Document {}

const ConcernStatusHistorySchema = new Schema<IConcernStatusHistoryDoc>(
  {
    concern: {
      type: Schema.Types.ObjectId,
      ref: "Concern",
      required: true,
      immutable: true,
    },
    from: { type: String, enum: CONCERN_STATUSES },
    to: { type: String, enum: CONCERN_STATUSES, required: true },
    changedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      immutable: true,
    },
    reason: { type: String, trim: true, maxlength: 500 },
  },
  { timestamps: true }
);

ConcernStatusHistorySchema.index({ concern: 1, createdAt: 1 });

const ConcernStatusHistory =
  models?.ConcernStatusHistory ||
  model<IConcernStatusHistoryDoc>(
    "ConcernStatusHistory",
    ConcernStatusHistorySchema
  );

export default ConcernStatusHistory;
