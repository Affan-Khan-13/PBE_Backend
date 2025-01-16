import express from "express";
import {
  bookWorkout,
  cancelWorkout,
  clientHome,
  clientLogin,
  clientRegistration,
  getAllClientWorkouts,
  getAllCoaches,
  getCoachById,
  getFilteredCoaches,
  workoutFeedback,
} from "../controllers/clientController";
import { protectClient } from "../middleware/authMiddleware";
const router = express.Router();

router.route("/").get(clientHome);
router.route("/signup").post(clientRegistration);
router.route("/sginin").post(clientLogin);
router.route("/allCoaches").get(getAllCoaches);
router.route("/getFilteredCoaches").get(getFilteredCoaches);
router.route("/coachbyid/:id").get(getCoachById);
router.route("/allWorkouts").get(protectClient, getAllClientWorkouts);
router.route("/bookWorkout").post(protectClient, bookWorkout);
router.route("/cancelWorkout").put(protectClient, cancelWorkout);
router.route("/workoutfeedback").put(protectClient, workoutFeedback);

export default router;
