import { Document, model, models, Schema } from "mongoose";

export interface IConcernAttachment {
  concern: Schema.Types.ObjectId;
  uploadedBy: Schema.Types.ObjectId;
  name: string;
  mimeType: string;
  size: number;
  data: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IConcernAttachmentDoc
  extends IConcernAttachment,
    Document {}

const ConcernAttachmentSchema = new Schema<IConcernAttachmentDoc>(
  {
    concern: {
      type: Schema.Types.ObjectId,
      ref: "Concern",
      required: true,
      immutable: true,
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      immutable: true,
    },
    name: { type: String, required: true, trim: true, maxlength: 160 },
    mimeType: { type: String, required: true, trim: true },
    size: { type: Number, required: true, min: 1, max: 2_000_000 },
    data: { type: String, required: true, select: false },
  },
  { timestamps: true }
);

ConcernAttachmentSchema.index({ concern: 1, createdAt: 1 });

const ConcernAttachment =
  models?.ConcernAttachment ||
  model<IConcernAttachmentDoc>("ConcernAttachment", ConcernAttachmentSchema);

export default ConcernAttachment;
