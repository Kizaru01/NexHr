import { Document, model, models, Schema } from "mongoose";

export interface IConcernAuditLog {
  concern: Schema.Types.ObjectId;
  actor: Schema.Types.ObjectId;
  action:
    | "created"
    | "viewed"
    | "status_changed"
    | "priority_changed"
    | "note_added"
    | "archived";
  details?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface IConcernAuditLogDoc extends IConcernAuditLog, Document {}

const ConcernAuditLogSchema = new Schema<IConcernAuditLogDoc>(
  {
    concern: {
      type: Schema.Types.ObjectId,
      ref: "Concern",
      required: true,
      immutable: true,
    },
    actor: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      immutable: true,
    },
    action: {
      type: String,
      enum: [
        "created",
        "viewed",
        "status_changed",
        "priority_changed",
        "note_added",
        "archived",
      ],
      required: true,
    },
    details: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

ConcernAuditLogSchema.index({ concern: 1, createdAt: -1 });

const ConcernAuditLog =
  models?.ConcernAuditLog ||
  model<IConcernAuditLogDoc>("ConcernAuditLog", ConcernAuditLogSchema);

export default ConcernAuditLog;
