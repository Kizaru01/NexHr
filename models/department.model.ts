import { model, models, Schema, Document } from "mongoose";
export interface IDepartment {
  name: string;
  nameKey: string;
  code?: string;
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
      trim: true,
    },

    nameKey: {
      type: String,
      required: true,
      unique: true,
      select: false,
    },

    code: {
      type: String,
      unique: true,
      sparse: true,
      uppercase: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
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

DepartmentSchema.pre("validate", function normalizeNameKey() {
  if (this.name) {
    this.nameKey = this.name.trim().toLocaleLowerCase("en-US");
  }
});

const Department =
  models?.Department || model<IDepartmentDoc>("Department", DepartmentSchema);
export default Department;
