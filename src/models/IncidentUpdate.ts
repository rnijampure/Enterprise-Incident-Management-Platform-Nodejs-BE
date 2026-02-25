import mongoose, { Schema, Document } from "mongoose";

export interface IIncidentUpdate extends Document {
  incident: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  fieldChanged: string;
  oldValue: string;
  newValue: string;
  createdAt: Date;
}

const IncidentUpdateSchema: Schema = new Schema(
  {
    incident: { type: Schema.Types.ObjectId, ref: "Incident", required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    fieldChanged: { type: String, required: true },
    oldValue: { type: String },
    newValue: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export default mongoose.model<IIncidentUpdate>(
  "IncidentUpdate",
  IncidentUpdateSchema,
);
