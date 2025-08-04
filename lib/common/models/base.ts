import mongoose, { Document, Schema } from "mongoose";
import { config } from "dotenv";

const dbUri = process.env.MONGODB_URI as string;
let db: mongoose.Mongoose | undefined = undefined;

(async () => {
    if (!mongoose.connection.readyState) {
      console.log('Connecting to database:', dbUri);
      db = await mongoose.connect(dbUri);
    }
})();

export interface IBaseDocument extends Document {
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
  _id: mongoose.Types.ObjectId;
  __v: number;
}

export const getBaseSchema = () => {
  return new Schema({
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    isDeleted: { type: Boolean, default: () => false},
  });
}

export const defineModel = <T extends IBaseDocument>(name: string, schema: Schema) => {
  return mongoose.models[name] as mongoose.Model<T> || mongoose.model<T>(name, schema);
}