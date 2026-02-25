import mongoose, { Schema, Document } from "mongoose";

export interface ITeam extends Document {
  name: string;
  departmentId: mongoose.Types.ObjectId;
}

const TeamSchema = new Schema({
  name: { type: String, required: true },
  departmentId: {
    type: Schema.Types.ObjectId,
    ref: "Department",
    required: true,
  },
});

export default mongoose.model<ITeam>("Team", TeamSchema);
