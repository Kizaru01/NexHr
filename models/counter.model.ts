import { Document, model, models, Schema } from "mongoose";

export interface ICounter {
  _id: string;
  sequence: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICounterDoc extends ICounter, Document<string> {}

const CounterSchema = new Schema<ICounterDoc>(
  {
    _id: {
      type: String,
      required: true,
    },
    sequence: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Counter = models?.Counter || model<ICounterDoc>("Counter", CounterSchema);

export default Counter;
