import { Request, Response } from "express";
import CoachModel from "../models/CoachModel";
import bcrypt from "bcrypt";

const adminHome = (req: Request, res: Response) => {
  res.send("Admin route works");
};

const addCoach = async (req: Request, res: Response) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      title,
      about,
      specialization,
    } = req.body;
    const missingFields = [];

    if (!firstName) missingFields.push("firstName");
    if (!lastName) missingFields.push("lastName");
    if (!email) missingFields.push("email");
    if (!password) missingFields.push("password");
    if (!title) missingFields.push("title");
    if (!about) missingFields.push("about");
    if (!specialization) missingFields.push("specialization");

    if (missingFields.length > 0) {
      res.status(400).json({
        error: `Missing required fields: ${missingFields.join(", ")}`,
      });
      return;
    }

    const existingUser = await CoachModel.findOne({ email });
    if (existingUser) {
      res.status(409).json({
        error: "Coach already exists, please login",
      });
      return;
    }

    const newCoach = new CoachModel({
      firstName,
      lastName,
      email,
      title,
      about,
      specialization,
    });

    const salt = await bcrypt.genSalt(10);
    newCoach.password = await bcrypt.hash(password, salt);

    await newCoach.save();
    res.status(201).json({ message: "Coach registered successfully." });
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export { adminHome, addCoach };
