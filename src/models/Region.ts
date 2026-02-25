import mongoose, { Schema, Document } from "mongoose";

export interface IRegion extends Document {
  name: string;
}

const RegionSchema = new Schema({ name: { type: String, required: true } });

export default mongoose.model<IRegion>("Region", RegionSchema);
