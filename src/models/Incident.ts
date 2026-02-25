import mongoose, { Schema, Document } from "mongoose";

export interface IIncident extends Document {
  ticketId: string;
  title: string;
  description: string;
  status:
    | "open"
    | "in_progress"
    | "resolved"
    | "closed"
    | "reopened"
    | "invalid"
    | "obsolete";
  severity: "low" | "medium" | "high" | "critical";
  type: "network" | "hardware" | "software" | "security" | "other";
  category:
    | "performance"
    | "availability"
    | "security breach"
    | "data loss"
    | "other";
  assignee?: mongoose.Types.ObjectId;
  reporter: mongoose.Types.ObjectId;
  region: string;
  department: string;
  escalationLevel: "team" | "department" | "external support";
  createdAt: Date;
  updatedAt: Date;
}

const IncidentSchema: Schema = new Schema(
  {
    ticketId: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    status: {
      type: String,
      enum: [
        "open",
        "in_progress",
        "resolved",
        "closed",
        "reopened",
        "invalid",
        "obsolete",
      ],
      default: "open",
    },
    severity: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      required: true,
    },
    type: {
      type: String,
      enum: ["network", "hardware", "software", "security", "other"],
      required: true,
    },
    category: {
      type: String,
      enum: [
        "performance",
        "availability",
        "security breach",
        "data loss",
        "other",
      ],
      required: true,
    },
    assignee: { type: Schema.Types.ObjectId, ref: "User" },
    reporter: { type: Schema.Types.ObjectId, ref: "User", required: true },
    region: { type: String, required: true },
    department: { type: String, required: true },
    escalationLevel: {
      type: String,
      enum: ["team", "department", "external support"],
      default: "team",
    },
  },
  { timestamps: true },
);

IncidentSchema.index({ status: 1, severity: 1, region: 1 });

export default mongoose.model<IIncident>("Incident", IncidentSchema);
