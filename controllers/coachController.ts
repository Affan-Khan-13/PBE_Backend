import { Request, Response } from "express";
import { Client } from "../models/clientModel";
import CoachModel, { Coach } from "../models/CoachModel";
import WorkoutModel, { WorkoutStatus } from "../models/workout";
declare global {
  namespace Express {
    interface Request {
      user?: Client | Coach; // Optional user property, as it may or may not be set
    }
  }
}

const coachHome = (req: Request, res: Response) => {
  res.send("Coach route works");
};

const updateSchedule = async (req: Request, res: Response) => {
  try {
    if (req.user) {
      const { type, Slots } = req.body;
      const coach = await CoachModel.findById(req.user._id);
      if (!coach) {
        res.status(404).json({ error: "Coach not found" });
        return;
      }
      //   if (type === "everyday") {
      //     coach?.schedule.everydayTimeSlot = Slots;
      //   } else if (type === "weekly") {
      //   } else if (type === "specificDates") {
      //   } else {
      //     res.status(400).json({ error: "Invalid Type" });
      //   }

      switch (type) {
        case "everyday":
          if (!Slots || Slots.length === 0) {
            res
              .status(400)
              .json({ error: "Specific dates and time slots are required" });
            return;
          }
          if (!Array.isArray(Slots)) {
            res
              .status(400)
              .json({ error: "Everyday time slots should be an array" });
            return;
          }
          coach.schedule.type = "everyday";
          coach.schedule.everydayTimeSlot = Slots;
          break;

        case "weekly":
          if (!Slots) {
            res.status(400).json({ error: "Weekly schedule is required" });
            return;
          }
          for (const day in Slots) {
            if (Slots.hasOwnProperty(day)) {
              const slots = Slots[day];
              // Only validate if there are time slots for the day
              if (slots.length > 0) {
                if (!Array.isArray(slots)) {
                  res
                    .status(400)
                    .json({ error: `Time slots for ${day} must be an array` });
                  return;
                }
              }
            }
          }
          coach.schedule.type = "weekly";
          coach.schedule.weeklySchedule = Slots;
          break;

        case "specificDates":
          if (!Slots || Slots.length === 0) {
            res
              .status(400)
              .json({ error: "Specific dates and time slots are required" });
            return;
          }

          for (const { date, timeSlots } of Slots) {
            console.log(date, timeSlots);
            if (!date || !timeSlots || timeSlots.length === 0) {
              res.status(400).json({
                error: `Invalid specific date or time slots for ${date}`,
              });
              return;
            }
            if (!Array.isArray(timeSlots)) {
              res
                .status(400)
                .json({ error: `Time slots for ${date} must be an array` });
              return;
            }
          }
          coach.schedule.type = "specificDates";
          coach.schedule.specificDates = Slots;
          break;

        default:
          res.status(400).json({ error: "Invalid schedule type" });
          return;
      }

      await coach.save();
      res.status(200).json({ message: "Updated Schedule" });
    }
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getAllCoachWorkouts = async (req: Request, res: Response) => {
  try {
    if (req.user) {
      const workouts = await WorkoutModel.find({ coach: req.user._id });
      res.status(200).json(workouts);
    }
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const markWorkoutAsDone = async (req: Request, res: Response) => {
  try {
    const { workoutId } = req.body;
    const workout = await WorkoutModel.findById(workoutId);
    if (!workout) {
      res
        .status(404)
        .json({ error: "Invalid Workout Id, no such workout found" });
      return;
    }
    workout.status = WorkoutStatus.Waiting_for_feedback;
    await workout.save();
    res.status(200).json({ message: "Workout is marked as done" });
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export { coachHome, updateSchedule, getAllCoachWorkouts, markWorkoutAsDone };
