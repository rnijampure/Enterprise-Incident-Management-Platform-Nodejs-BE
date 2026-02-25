import mongoose, { Schema, Document } from "mongoose";

export interface IIncidentComment extends Document {
  incidentId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  comment: string;
  editedAt?: Date; // optional, only if edited
  createdAt: Date;
}

const IncidentCommentSchema = new Schema(
  {
    incidentId: {
      type: Schema.Types.ObjectId,
      ref: "Incident",
      required: true,
    },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    comment: { type: String, required: true },
    editedAt: { type: Date },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export default mongoose.model<IIncidentComment>(
  "IncidentComment",
  IncidentCommentSchema,
);
