//backend\src\models\user.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  role: "engineer" | "manager" | "admin";
  team: string;
  department: string;
  region: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role: {
      type: String,
      enum: ["engineer", "manager", "admin"],
      default: "engineer",
    },
    team: { type: String, required: true },
    department: { type: String, required: true },
    region: { type: String, required: true },
  },
  { timestamps: true },
);

export default mongoose.model<IUser>("User", UserSchema);
