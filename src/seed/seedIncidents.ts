import mongoose from "mongoose";
import dotenv from "dotenv";
import Incident from "../models/Incident.js";
import User from "../models/User.js";
import Team from "../models/Team.js";
import Department from "../models/Department.js";
import Region from "../models/Region.js";
import connectDB from "../config/db.js";

dotenv.config();

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
const types = ["network", "hardware", "software", "security", "other"] as const;
const categories = [
  "performance",
  "availability",
  "security breach",
  "data loss",
  "other",
] as const;
const escalationLevels = ["team", "department", "external support"] as const;

const pickRandom = <T>(arr: T[]): T => {
  if (arr.length === 0)
    throw new Error("Cannot pick random element from empty array");
  return arr[Math.floor(Math.random() * arr.length)]!;
};
const randomDate = (start: Date, end: Date) =>
  new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

const seedIncidents = async () => {
  try {
    await connectDB();

    await Incident.deleteMany({});

    const users = await User.find();
    const teams = await Team.find();
    const departments = await Department.find();
    const regions = await Region.find();

    if (
      !users.length ||
      !teams.length ||
      !departments.length ||
      !regions.length
    )
      throw new Error("Users or Org data missing! Seed them first.");

    const now = new Date();
    const past = new Date();
    past.setMonth(now.getMonth() - 6);

    const incidentsData = [];

    for (let i = 1; i <= 50; i++) {
      const reporter = pickRandom(users);
      const assignee = Math.random() > 0.3 ? pickRandom(users) : undefined; // 70% have assignees
      const team = pickRandom(teams);
      const department = departments.find((d) =>
        d._id.equals(team.departmentId),
      );
      const region = departments.find((d) => d._id.equals(team.departmentId))
        ? regions.find((r) => r._id.equals(department?.regionId))
        : pickRandom(regions);

      const createdAt = randomDate(past, now);
      let resolvedAt: Date | undefined = undefined;
      const status = pickRandom(statuses as unknown as string[]);

      if (["resolved", "closed"].includes(status as string)) {
        resolvedAt = randomDate(createdAt, now);
      }

      incidentsData.push({
        ticketId: `INC-${1000 + i}`,
        title: `${pickRandom(categories as unknown as string[]).toUpperCase()} Incident ${i}`,
        description: `This is a ${pickRandom(categories as unknown as string[])} incident for testing purposes.`,
        status,
        severity: pickRandom(severities as unknown as string[]),
        type: pickRandom(types as unknown as string[]),
        category: pickRandom(categories as unknown as string[]),
        reporter: reporter._id,
        assignee: assignee?._id,
        region: region?.name || "Unknown",
        department: department?.name || "Unknown",
        escalationLevel: pickRandom(escalationLevels as unknown as string[]),
        createdAt,
        updatedAt: createdAt,
        resolvedAt,
      });
    }

    await Incident.create(incidentsData as any[]);

    console.log(`✅ Seeded ${incidentsData.length} incidents successfully`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding incidents failed:", error);
    process.exit(1);
  }
};

seedIncidents();
