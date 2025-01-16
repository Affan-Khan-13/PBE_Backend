import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import ClientModel from "../models/clientModel";
import CoachModel from "../models/CoachModel";
import WorkoutModel, { WorkoutStatus } from "../models/workout";
import { ObjectId } from "mongoose"; // If using ObjectId, import it from mongoose

const clientHome = (req: Request, res: Response) => {
  res.send("Client route works");
};

const clientRegistration = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { firstName, lastName, email, password, target, preferableActivity } =
      req.body;

    const missingFields = [];

    if (!firstName) missingFields.push("firstName");
    if (!lastName) missingFields.push("lastName");
    if (!email) missingFields.push("email");
    if (!password) missingFields.push("password");
    if (!target) missingFields.push("target");
    if (!preferableActivity) missingFields.push("preferableActivity");

    if (missingFields.length > 0) {
      res.status(400).json({
        error: `Missing required fields: ${missingFields.join(", ")}`,
      });
      return;
    }

    const existingUser = await ClientModel.findOne({ email });
    if (existingUser) {
      res.status(409).json({
        error: "User already exists, please login",
      });
      return;
    }

    const newClient = new ClientModel({
      firstName,
      lastName,
      email,
      target,
      preferableActivity,
    });

    const salt = await bcrypt.genSalt(10);
    newClient.password = await bcrypt.hash(password, salt);

    await newClient.save();
    res.status(201).json({ message: "User registered successfully." });
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const clientLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const missingFields = [];
    if (!email) missingFields.push("email");
    if (!password) missingFields.push("password");
    if (missingFields.length > 0) {
      res.status(400).json({
        error: `Missing required fields: ${missingFields.join(", ")}`,
      });
      return;
    }

    let user;
    user = await ClientModel.findOne({ email });
    if (!user) {
      user = await CoachModel.findOne({ email });
    }
    if (!user) {
      res.status(404).json({ error: "Invalid Credentials" });
      return;
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      res.status(401).json({ error: "Invalid Credentials" });
      return;
    }
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET environment variable is not defined");
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    res
      .status(200)
      .json({ message: "Login Successful", userDetails: user, token });
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getAllCoaches = async (req: Request, res: Response) => {
  try {
    const allCoaches = await CoachModel.find().select(
      "_id firstName lastName about"
    );
    res.status(200).json(allCoaches);
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getCoachById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const coach = await CoachModel.findById(id);
    if (!coach) {
      res.status(404).json({ error: "No such Coach Found" });
      return;
    }
    res.status(200).json(coach);
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getFilteredCoaches = async (req: Request, res: Response) => {
  try {
    const { date, sport, coach: coachId } = req.query;
    if (!date || !sport) {
      res.status(400).json({ error: "Missing date or sport" });
      return;
    }

    const dateString = Array.isArray(date) ? date[0] : date;

    if (typeof dateString !== "string") {
      res.status(400).json({ error: "Invalid date format" });
      return;
    }

    // Strip 'Z' if present
    const localDateString = dateString.replace("Z", ""); // If the string has 'Z', remove it

    // Create the Date object from the string (without Z)
    const targetDate = new Date(localDateString);

    // Check if the date is valid
    if (isNaN(targetDate.getTime())) {
      res.status(400).json({ error: "Invalid date" });
      return;
    }

    const targetTime = targetDate.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });

    // console.log("Target Time:", targetTime); // "08:00 AM", "12:30 PM", etc.

    let query: any = { specialization: { $in: [sport] } };

    if (coachId) {
      query = { ...query, _id: coachId };
    }

    const coaches = await CoachModel.find(query).select(
      "-password -createdAt -updatedAt -specialization -role"
    );

    // Function to get available time slots based on the coach's schedule
    const getAvailableTimeSlots = (schedule: any, targetDate: Date) => {
      const timeArr: string[] = [];
      const dayOfWeek = targetDate.toLocaleString("en-us", { weekday: "long" });

      // Handle weeklySchedule
      if (schedule.type === "weekly") {
        if (schedule.weeklySchedule[dayOfWeek]) {
          timeArr.push(...schedule.weeklySchedule[dayOfWeek]);
        }
      }

      // Handle specificDates
      if (schedule.type === "specificDates") {
        const targetDateString = targetDate.toISOString().split("T")[0]; // 'YYYY-MM-DD'
        const specificDate = schedule.specificDates.find(
          (entry: any) => entry.date === targetDateString
        );
        if (specificDate) {
          timeArr.push(...specificDate.timeSlots);
        }
      }

      // Handle everydayTimeSlot
      if (schedule.type === "everyday") {
        timeArr.push(...schedule.everydayTimeSlot);
      }

      return timeArr;
    };

    // Fetch booked workouts for the target date and coach email
    const bookedWorkouts = await WorkoutModel.find({
      date: targetDate.toISOString(), // Match the exact date-time for booking
      coach: { $in: coaches.map((coach) => coach._id) }, // Ensure we're checking only the available coaches
      status: "Scheduled",
    });

    const filteredCoaches = coaches.filter((coach) => {
      const { schedule } = coach;
      const timeArr = getAvailableTimeSlots(schedule, targetDate);

      // Check if the coach has available time slots
      const isTimeSlotAvailable = timeArr.some((slot) => {
        const [startTime, endTime] = slot.split(" - ");
        const zoneArr = endTime.split(" ");
        const AMPM = zoneArr[zoneArr.length - 1];
        const resultTime = `${startTime} ${AMPM}`;
        return resultTime === targetTime; // Compare only the time part
      });

      // Check if the coach is already booked for the requested time
      const isAlreadyBooked = bookedWorkouts.some((workout) => {
        // Type the coach._id explicitly as ObjectId (or string if it's a string-based ID)
        if (workout.coach) {
          const coachId = coach._id as ObjectId; // Explicitly cast coach._id to ObjectId or string
          return workout.coach.toString() === coachId.toString(); // Ensure comparison works as both are ObjectIds
        }
        return false;
      });

      // Only keep coaches who are available and not already booked
      return isTimeSlotAvailable && !isAlreadyBooked;
    });

    // Return the available coaches or a message if no coaches found
    if (filteredCoaches.length === 0) {
      res.status(200).json([]);
      return;
    }

    // Remove the schedule field and add the timeArr to the response
    const result = filteredCoaches.map((coach) => {
      const { schedule, about, ...coachDetails } = coach.toObject(); // Destructure and remove 'about'
      return {
        ...coachDetails,
        timeArr: getAvailableTimeSlots(schedule, targetDate),
        description: about, // Rename 'about' to 'description'
        date: date,
        workoutType: sport,
      };
    });

    res.status(200).json(result);
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const bookWorkout = async (req: Request, res: Response) => {
  try {
    if (req.user) {
      const { date, coachEmail, workoutType } = req.body;
      const client = await ClientModel.findById(req.user._id);
      const coach = await CoachModel.findOne({ email: coachEmail });
      const newWorkout = new WorkoutModel({
        client: client?._id,
        coach: coach?._id,
        date,
        workoutType,
        description: coach?.about,
      });

      await newWorkout.save();
      res.status(201).json({ message: "Booked Successfully" });
    }
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getAllClientWorkouts = async (req: Request, res: Response) => {
  try {
    if (req.user) {
      const workouts = await WorkoutModel.find({ client: req.user._id });
      res.status(200).json(workouts);
    }
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const cancelWorkout = async (req: Request, res: Response) => {
  try {
    const { workoutId } = req.body;
    const workout = await WorkoutModel.findById(workoutId);
    if (!workout) {
      res
        .status(404)
        .json({ error: "Invalid Workout Id, no such workout found" });
      return;
    }
    workout.status = WorkoutStatus.Canceled;
    await workout.save();
    res.status(200).json({ message: "Workout is cancelled" });
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const workoutFeedback = async (req: Request, res: Response) => {
  try {
    const { workoutId, feedback } = req.body;
    const workout = await WorkoutModel.findById(workoutId);
    if (!workout) {
      res
        .status(404)
        .json({ error: "Invalid Workout Id, no such workout found" });
      return;
    }
    workout.status = WorkoutStatus.Finished;
    workout.feedback = feedback;
    await workout.save();
    res.status(200).json({ message: "Feedback is succesfull" });
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export {
  clientHome,
  clientRegistration,
  clientLogin,
  getAllCoaches,
  getCoachById,
  getFilteredCoaches,
  getAllClientWorkouts,
  bookWorkout,
  cancelWorkout,
  workoutFeedback,
};
