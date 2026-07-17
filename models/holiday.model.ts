import { Document, model, models, Schema } from "mongoose";

export interface IHoliday {
  name: string;
  date: Date;
  description?: string;
}

export interface IHolidayDoc extends IHoliday, Document {}

const HolidaySchema = new Schema<IHolidayDoc>(
  {
    name: { type: String, required: true, trim: true },
    date: { type: Date, required: true },
    description: { type: String, trim: true },
  },
  { timestamps: true }
);

HolidaySchema.index({ date: 1 });

const Holiday = models?.Holiday || model<IHolidayDoc>("Holiday", HolidaySchema);

export default Holiday;
