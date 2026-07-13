import { model, models, Schema, Document } from "mongoose";
export interface IDepartment {
  name: string;
  code: string;
  description?: string;
  isActive: boolean;

  createdAt: Date;
  updatedAt: Date;
}
export interface IDepartmentDoc extends IDepartment, Document {}
const DepartmentSchema = new Schema<IDepartmentDoc>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    description: String,

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);
const Department =
  models?.Department || model<IDepartmentDoc>("Department", DepartmentSchema);
export default Department;
