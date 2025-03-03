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

/**
 * @swagger
 * tags:
 *   name: Clients
 *   description: Client-related endpoints
 */

/**
 * @swagger
 * /client:
 *   get:
 *     summary: Client home route
 *     tags: [Clients]
 *     responses:
 *       200:
 *         description: Home route for clients
 */
router.route("/").get(clientHome);

/**
 * @swagger
 * /client/signup:
 *   post:
 *     summary: Register a new client
 *     tags: [Clients]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "John Doe"
 *               email:
 *                 type: string
 *                 example: "john@example.com"
 *               password:
 *                 type: string
 *                 example: "password123"
 *     responses:
 *       201:
 *         description: Client registered successfully
 */
router.route("/signup").post(clientRegistration);

/**
 * @swagger
 * /client/signin:
 *   post:
 *     summary: Client login
 *     tags: [Clients]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: "john@example.com"
 *               password:
 *                 type: string
 *                 example: "password123"
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Unauthorized
 */
router.route("/sginin").post(clientLogin);

/**
 * @swagger
 * /client/allCoaches:
 *   get:
 *     summary: Get all coaches
 *     tags: [Clients]
 *     responses:
 *       200:
 *         description: List of coaches
 */
router.route("/allCoaches").get(getAllCoaches);

/**
 * @swagger
 * /client/getFilteredCoaches:
 *   get:
 *     summary: Get filtered coaches
 *     tags: [Clients]
 *     parameters:
 *       - in: query
 *         name: specialization
 *         schema:
 *           type: string
 *         description: Filter by coach specialization
 *     responses:
 *       200:
 *         description: List of filtered coaches
 */
router.route("/getFilteredCoaches").get(getFilteredCoaches);

/**
 * @swagger
 * /client/coachbyid/{id}:
 *   get:
 *     summary: Get coach details by ID
 *     tags: [Clients]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Coach ID
 *     responses:
 *       200:
 *         description: Coach details retrieved successfully
 *       404:
 *         description: Coach not found
 */
router.route("/coachbyid/:id").get(getCoachById);

/**
 * @swagger
 * /client/allWorkouts:
 *   get:
 *     summary: Get all client workouts
 *     tags: [Clients]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of client workouts
 *       401:
 *         description: Unauthorized
 */
router.route("/allWorkouts").get(protectClient, getAllClientWorkouts);

/**
 * @swagger
 * /client/bookWorkout:
 *   post:
 *     summary: Book a workout session
 *     tags: [Clients]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               workoutId:
 *                 type: string
 *                 example: "workout123"
 *     responses:
 *       201:
 *         description: Workout booked successfully
 *       401:
 *         description: Unauthorized
 */
router.route("/bookWorkout").post(protectClient, bookWorkout);

/**
 * @swagger
 * /client/cancelWorkout:
 *   put:
 *     summary: Cancel a booked workout
 *     tags: [Clients]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               workoutId:
 *                 type: string
 *                 example: "workout123"
 *     responses:
 *       200:
 *         description: Workout cancelled successfully
 *       401:
 *         description: Unauthorized
 */
router.route("/cancelWorkout").put(protectClient, cancelWorkout);

/**
 * @swagger
 * /client/workoutfeedback:
 *   put:
 *     summary: Submit feedback for a workout
 *     tags: [Clients]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               workoutId:
 *                 type: string
 *                 example: "workout123"
 *               feedback:
 *                 type: string
 *                 example: "Great workout session!"
 *     responses:
 *       200:
 *         description: Feedback submitted successfully
 *       401:
 *         description: Unauthorized
 */
router.route("/workoutfeedback").put(protectClient, workoutFeedback);

export default router;
