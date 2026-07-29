import { model, models, Schema, Document } from "mongoose";

export interface IPosition {
  name: string;
  nameKey: string;
  department: Schema.Types.ObjectId;
  description?: string;
  isActive: boolean;
  salary: {
    basic: number;
    allowance?: number;
  };
  createdAt: Date;
  updatedAt: Date;
}
export interface IPositionDoc extends IPosition, Document {}
const PositionSchema = new Schema<IPositionDoc>(
  {
    name: { type: String, required: true, trim: true },
    nameKey: { type: String, required: true, select: false },
    department: {
      type: Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },
    description: {
      type: String,
      trim: true,
    },
    salary: {
      basic: {
        type: Number,
        required: true,
        min: 0,
      },
      allowance: {
        type: Number,
        default: 0,
        min: 0,
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);
PositionSchema.index(
  {
    department: 1,
    nameKey: 1,
  },
  {
    unique: true,
  }
);
PositionSchema.pre("validate", function normalizeNameKey() {
  if (this.name) {
    this.nameKey = this.name.trim().toLocaleLowerCase("en-US");
  }
});

const Position =
  models?.Position || model<IPositionDoc>("Position", PositionSchema);
export default Position;
