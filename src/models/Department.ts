import mongoose, { Schema, Document } from "mongoose";

export interface IDepartment extends Document {
  name: string;
  regionId: mongoose.Types.ObjectId;
}

const DepartmentSchema = new Schema({
  name: { type: String, required: true },
  regionId: { type: Schema.Types.ObjectId, ref: "Region", required: true },
});

export default mongoose.model<IDepartment>("Department", DepartmentSchema);
