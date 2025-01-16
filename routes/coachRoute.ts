import express from "express";
import {
  coachHome,
  getAllCoachWorkouts,
  markWorkoutAsDone,
  updateSchedule,
} from "../controllers/coachController";
import { protectCoach } from "../middleware/authMiddleware";
const router = express.Router();

router.route("/").get(coachHome);
router.route("/updateSchedule").put(protectCoach, updateSchedule);
router.route("/allWorkouts").get(protectCoach, getAllCoachWorkouts);
router.route("/markasdone").put(protectCoach, markWorkoutAsDone);

export default router;
