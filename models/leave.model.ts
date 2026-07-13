import { Document, model, models, Schema } from "mongoose";

export interface ILeave {
  employee: Schema.Types.ObjectId;
  leaveType:
    | "Annual"
    | "Sick"
    | "Emergency"
    | "Maternity"
    | "Paternity"
    | "Without Pay";
  startDate: Date;
  endDate: Date;
  reason?: string;
  status: "Pending" | "Approved" | "Rejected" | "Cancelled";
  approvedBy?: Schema.Types.ObjectId;
  approvedAt?: Date;
  remarks?: string;
}
export interface ILeaveDoc extends ILeave, Document {}
const LeaveSchema = new Schema<ILeaveDoc>(
  {
    employee: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    leaveType: {
      type: String,
      enum: [
        "Annual",
        "Sick",
        "Emergency",
        "Maternity",
        "Paternity",
        "Without Pay",
      ],
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    reason: String,
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected", "Cancelled"],
      default: "Pending",
    },
    approvedBy: { type: Schema.Types.ObjectId, ref: "User" },
    approvedAt: Date,
    remarks: String,
  },
  { timestamps: true }
);

const Leave = models?.Leave || model<ILeaveDoc>("Leave", LeaveSchema);
export default Leave;
