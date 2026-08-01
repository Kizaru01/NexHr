import { Document, model, models, Schema } from "mongoose";

export interface IEmployeeProfileNote {
  employee: Schema.Types.ObjectId;
  author: Schema.Types.ObjectId;
  body: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IEmployeeProfileNoteDoc
  extends IEmployeeProfileNote,
    Document {}

const EmployeeProfileNoteSchema = new Schema<IEmployeeProfileNoteDoc>(
  {
    employee: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
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
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

EmployeeProfileNoteSchema.index({ employee: 1, expiresAt: 1, createdAt: -1 });
EmployeeProfileNoteSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const EmployeeProfileNote =
  models?.EmployeeProfileNote ||
  model<IEmployeeProfileNoteDoc>(
    "EmployeeProfileNote",
    EmployeeProfileNoteSchema
  );

export default EmployeeProfileNote;
