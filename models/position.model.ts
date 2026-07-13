import { model, models, Schema, Document } from "mongoose";

export interface IPosition {
  title: string;
  department: Schema.Types.ObjectId;
  description?: string;
  isActive: boolean;
  minSalary?: string;
  maxSalary?: string;
  createdAt: Date;
  updatedAt: Date;
}
export interface IPositionDoc extends IPosition, Document {}
const PositionSchema = new Schema<IPositionDoc>(
  {
    title: { type: String, required: true, trim: true },
    department: {
      type: Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },
    description: String,
    isActive: {
      type: Boolean,
      default: true,
    },
    minSalary: {
      type: String,
    },
    maxSalary: { type: String },
  },
  {
    timestamps: true,
  }
);
PositionSchema.index(
  {
    department: 1,
    title: 1,
  },
  {
    unique: true,
  }
);
const Position =
  models?.Position || model<IPositionDoc>("Position", PositionSchema);
export default Position;
