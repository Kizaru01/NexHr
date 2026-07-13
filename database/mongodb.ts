import mongoose, { Mongoose } from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("MONGODB is not defined");
}

declare global {
  var mongooseCache: {
    conn: Mongoose | null;
    promise: Promise<Mongoose> | null;
  };
}
const cached =
  global.mongooseCache ||
  (global.mongooseCache = { conn: null, promise: null });

const connectToDatabase = async (): Promise<Mongoose> => {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    });
  }

  try {
    cached.conn = await cached.promise;

    console.log("MONGODB CONNECTED SUCCESSFULLY");
    return cached.conn;
  } catch (error) {
    cached.promise = null;
    console.error(error);
    throw error;
  }
};
export default connectToDatabase;
