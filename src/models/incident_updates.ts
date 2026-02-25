import mongoose, { Schema, Document } from "mongoose";

export interface IIncidentUpdate extends Document {
  incidentId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  fieldChanged: string; // e.g., "status", "assignee"
  oldValue: string;
  newValue: string;
  createdAt: Date;
}

const IncidentUpdateSchema = new Schema(
  {
    incidentId: {
      type: Schema.Types.ObjectId,
      ref: "Incident",
      required: true,
    },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    fieldChanged: { type: String, required: true },
    oldValue: { type: String, required: true },
    newValue: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }, // Only need createdAt
);

export default mongoose.model<IIncidentUpdate>(
  "IncidentUpdate",
  IncidentUpdateSchema,
);
