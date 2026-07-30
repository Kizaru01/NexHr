import { Document, model, models, Schema } from "mongoose";

export interface IConcernNote {
  concern: Schema.Types.ObjectId;
  author: Schema.Types.ObjectId;
  body: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IConcernNoteDoc extends IConcernNote, Document {}

const ConcernNoteSchema = new Schema<IConcernNoteDoc>(
  {
    concern: {
      type: Schema.Types.ObjectId,
      ref: "Concern",
      required: true,
      immutable: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      immutable: true,
    },
    body: { type: String, required: true, trim: true, maxlength: 3_000 },
  },
  { timestamps: true }
);

ConcernNoteSchema.index({ concern: 1, createdAt: -1 });

const ConcernNote =
  models?.ConcernNote ||
  model<IConcernNoteDoc>("ConcernNote", ConcernNoteSchema);

export default ConcernNote;
