import mongoose, { Schema, Document } from "mongoose";

export interface IComment extends Document {
  incident: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  content: string;
  editedHistory: { content: string; editedAt: Date }[];
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema: Schema = new Schema(
  {
    incident: { type: Schema.Types.ObjectId, ref: "Incident", required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
    editedHistory: [
      {
        content: String,
        editedAt: Date,
      },
    ],
  },
  { timestamps: true },
);

export default mongoose.model<IComment>("Comment", CommentSchema);
