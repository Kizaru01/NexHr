import { Document, model, models, Schema } from "mongoose";

export interface IAttendanceCorrection {
  employee: Schema.Types.ObjectId;
  attendance: Schema.Types.ObjectId;
  reason: string;
  status: "Pending" | "Approved" | "Rejected";
  reviewedBy?: Schema.Types.ObjectId;
  reviewedAt?: Date;
  remarks?: string;
}

export interface IAttendanceCorrectionDoc extends IAttendanceCorrection, Document {}

const AttendanceCorrectionSchema = new Schema<IAttendanceCorrectionDoc>(
  {
    employee: { type: Schema.Types.ObjectId, ref: "Employee", required: true },
    attendance: { type: Schema.Types.ObjectId, ref: "Attendance", required: true },
    reason: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
    reviewedBy: { type: Schema.Types.ObjectId, ref: "User" },
    reviewedAt: Date,
    remarks: String,
  },
  { timestamps: true }
);

AttendanceCorrectionSchema.index(
  { employee: 1, attendance: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: "Pending" } }
);

const AttendanceCorrection =
  models?.AttendanceCorrection ||
  model<IAttendanceCorrectionDoc>("AttendanceCorrection", AttendanceCorrectionSchema);

export default AttendanceCorrection;
