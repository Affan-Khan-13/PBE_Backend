import mongoose, { Schema, Document, Model, Types } from "mongoose";

export enum WorkoutStatus {
  Scheduled = "Scheduled",
  Waiting_for_feedback = "Waiting for feedback",
  Finished = "Finished",
  Canceled = "Cancelled",
}

// Define the interface for the Client document
interface Workout extends Document {
  client?: Types.ObjectId;
  coach?: Types.ObjectId;
  date: Date;
  workoutType: String;
  description: String;
  status: WorkoutStatus;
  ratings: Number;
  feedback: String;
  duration: Number;
}

// Create the Mongoose schema
const WorkoutSchema: Schema<Workout> = new Schema(
  {
    client: {
      type: Schema.Types.ObjectId,
      ref: "Client", // Reference to the Client model
      required: false, // Optional client reference
    },
    coach: {
      type: Schema.Types.ObjectId,
      ref: "Coach", // Reference to the Coach model
      required: false, // Optional coach reference
    },
    date: {
      type: Date,
      required: true, // Date of the workout (required)
    },
    workoutType: {
      type: String,
      required: true, // Type of workout (required)
    },
    description: {
      type: String,
      required: true, // Description of the workout (required)
    },
    ratings: {
      type: Number,
      required: true, // Description of the workout (required)
      default: 0,
    },
    status: {
      type: String,
      enum: Object.values(WorkoutStatus), // Enum for the workout status
      default: WorkoutStatus.Scheduled, // Default status is 'pending'
      required: true, // Required field
    },
    feedback: {
      type: String,
    },
    duration: {
      type: Number,
    },
  },
  {
    timestamps: true, // Automatically add `createdAt` and `updatedAt`
    // _id: false, // Disable the default '_id' field so we can rename it
    // toJSON: {
    //   virtuals: true, // Allow virtuals to appear in JSON output
    // },
  }
);

// // Create a virtual field to rename _id to workout_id
// WorkoutSchema.virtual("workout_id").get(function () {
//   return this._id; // Return the original _id as workout_id
// });

// WorkoutSchema.set("toJSON", { virtuals: true }); // Include virtuals in the JSON output

// Create the Mongoose model
const WorkoutModel: Model<Workout> = mongoose.model<Workout>(
  "Workout",
  WorkoutSchema
);

export default WorkoutModel;
