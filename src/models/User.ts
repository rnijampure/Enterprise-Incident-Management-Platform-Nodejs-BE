//backend\src\models\user.ts
import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";
export interface IUser extends Document {
  name: string;
  email: string;
  role: "engineer" | "manager" | "admin";
  password: string; // New Field
  team: string;
  department: string;
  region: string;
  createdAt: Date;
  updatedAt: Date;
  matchPassword(enteredPassword: string): Promise<boolean>;
}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // New Field
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
// Hash password before saving to DB
// backend/src/models/User.ts

// ... inside your schema definition ...

UserSchema.pre("save", async function () {
  // REMOVE 'next' here
  if (!this.isModified("password")) return; // REMOVE 'return next()'

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password as string, salt);
    // No need to call next() because this is an async function
  } catch (error: any) {
    throw new Error(error);
  }
});
// Method to compare entered password with hashed password
UserSchema.methods.matchPassword = async function (enteredPassword: string) {
  return await bcrypt.compare(enteredPassword, this.password);
};
export default mongoose.model<IUser>("User", UserSchema);
