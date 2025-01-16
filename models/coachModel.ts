import mongoose, { Schema, Document, Model } from "mongoose";
import bcrypt from "bcrypt";

interface Schedule {
  type: "everyday" | "weekly" | "specificDates"; // Type of schedule
  everydayTimeSlot?: string[]; // Time slots for everyday availability
  weeklySchedule?: {
    Monday: string[];
    Tuesday: string[];
    Wednesday: string[];
    Thursday: string[];
    Friday: string[];
    Saturday: string[];
    Sunday: string[];
  }; // Time slots for each day of the week
  specificDates?: { date: string; timeSlots: string[] }[]; // Specific dates and their time slots
}

// Define the interface for the Client document
export interface Coach extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  ratings: number;
  title: string;
  about: string;
  role: string;
  specialization: string[];
  schedule: Schedule;
}

// Create the Mongoose schema
const CoachSchema: Schema<Coach> = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    title: { type: String, default: null },
    about: { type: String, default: null },
    ratings: { type: Number, default: 0 },
    role: {
      type: String,
      required: true,
      enum: ["client", "admin", "coach"],
      default: "coach",
    },
    specialization: { type: [String], default: [] },
    schedule: {
      type: {
        type: String,
        enum: ["everyday", "weekly", "specificDates"],
      },
      everydayTimeSlot: { type: [String] },
      weeklySchedule: {
        Monday: { type: [String], default: [] },
        Tuesday: { type: [String], default: [] },
        Wednesday: { type: [String], default: [] },
        Thursday: { type: [String], default: [] },
        Friday: { type: [String], default: [] },
        Saturday: { type: [String], default: [] },
        Sunday: { type: [String], default: [] },
      },
      specificDates: [
        {
          date: { type: String }, // Example: "2024-12-15"
          timeSlots: { type: [String] },
        },
      ],
    },
  },
  { timestamps: true } // Automatically add `createdAt` and `updatedAt`
);

// Create the Mongoose model

CoachSchema.methods.encryptPassword = async function (password: string) {
  if (!this.password) {
    return false;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(password, salt);
};

CoachSchema.methods.validatePassword = async function (password: string) {
  if (!this.password) {
    return false;
  }
  return bcrypt.compare(password, this.password);
};

const CoachModel: Model<Coach> = mongoose.model<Coach>("Coach", CoachSchema);
export default CoachModel;
