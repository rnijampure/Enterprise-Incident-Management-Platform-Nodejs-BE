import mongoose from "mongoose";
import dotenv from "dotenv";
import Incident from "../models/Incident.js";
import User from "../models/User.js";
import IncidentUpdate from "../models/incident_updates.js";
import IncidentComment from "../models/incident_comments.js";
import connectDB from "../config/db.js";

dotenv.config();

// Helpers
const randomDate = (start: Date, end: Date) =>
  new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

const pickRandom = <T>(arr: T[]): T => {
  if (arr.length === 0)
    throw new Error("Cannot pick random element from empty array");
  return arr[Math.floor(Math.random() * arr.length)]!;
};

const statuses = [
  "open",
  "in_progress",
  "resolved",
  "closed",
  "reopened",
  "invalid",
  "obsolete",
] as const;
const severities = ["low", "medium", "high", "critical"] as const;

const seedUpdatesAndComments = async () => {
  try {
    await connectDB();

    // Clear previous data
    await IncidentUpdate.deleteMany({});
    await IncidentComment.deleteMany({});

    const incidents = await Incident.find();
    const users = await User.find();

    if (incidents.length === 0 || users.length === 0)
      throw new Error("Incidents or Users missing! Seed them first.");

    const now = new Date();
    const past = new Date();
    past.setMonth(now.getMonth() - 6);

    const updatesData: any[] = [];
    const commentsData: any[] = [];

    for (const incident of incidents) {
      const numUpdates = Math.floor(Math.random() * 5) + 1; // 1-5 updates per incident
      const numComments = Math.floor(Math.random() * 4); // 0-3 comments per incident

      // 1️⃣ Generate updates
      let lastStatus = incident.status;
      for (let i = 0; i < numUpdates; i++) {
        const user: any = pickRandom(users);
        const field = pickRandom(["status", "severity", "assignee"]);
        let oldValue: string, newValue: string;

        if (field === "status") {
          newValue = pickRandom(statuses.filter((s) => s !== lastStatus));
          oldValue = lastStatus;
          lastStatus = newValue as (typeof statuses)[number];
        } else if (field === "severity") {
          oldValue = incident.severity;
          newValue = pickRandom(severities.filter((s) => s !== oldValue));
        } else {
          const assignee = pickRandom(users);
          oldValue = incident.assignee?.toString() || "Unassigned";
          newValue = assignee._id.toString();
        }

        updatesData.push({
          incidentId: incident._id,
          userId: user._id,
          fieldChanged: field,
          oldValue,
          newValue,
          createdAt: randomDate(past, now),
        });
      }

      // 2️⃣ Generate comments
      for (let j = 0; j < numComments; j++) {
        const user = pickRandom(users);
        const createdAt = randomDate(past, now);
        const edited =
          Math.random() > 0.5 ? randomDate(createdAt, now) : undefined;

        commentsData.push({
          incidentId: incident._id,
          userId: user._id,
          comment: `Auto-generated comment by ${user.name}`,
          createdAt,
          editedAt: edited,
        });
      }
    }

    await IncidentUpdate.create(updatesData);
    await IncidentComment.create(commentsData);

    console.log(`✅ Seeded ${updatesData.length} incident updates`);
    console.log(`✅ Seeded ${commentsData.length} incident comments`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding updates/comments failed:", error);
    process.exit(1);
  }
};

seedUpdatesAndComments();
