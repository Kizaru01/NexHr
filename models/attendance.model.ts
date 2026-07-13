import { Document, model, models, Schema } from "mongoose";

export interface IAttendance {
  employee: Schema.Types.ObjectId;
  date: Date;
  checkInTime?: Date;
  checkOutTime?: Date;
  status:
    | "Present"
    | "Absent"
    | "On Leave"
    | "Half Day"
    | "Holiday"
    | "Late"
    | "Weekend";
  workingHours?: number;
  overtimeHours?: number;
  remarks?: string;
}
export interface IAttendanceDoc extends IAttendance, Document {}
const AttendanceSchema = new Schema<IAttendanceDoc>(
  {
    employee: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    checkInTime: Date,
    checkOutTime: Date,
    status: {
      type: String,
      enum: [
        "Present",
        "Absent",
        "On Leave",
        "Half Day",
        "Holiday",
        "Late",
        "Weekend",
      ],
      required: true,
      default: "Present",
    },
    workingHours: Number,
    overtimeHours: Number,
    remarks: String,
  },
  { timestamps: true }
);

AttendanceSchema.index(
  {
    employee: 1,
    date: 1,
  },
  {
    unique: true,
  }
);

const Attendance =
  models?.Attendance || model<IAttendanceDoc>("Attendance", AttendanceSchema);
export default Attendance;
