import express from "express";
import { addCoach, adminHome } from "../controllers/adminController";
const router = express.Router();

router.route("/").get(adminHome);
router.route("/addcoach").post(addCoach);

export default router;
