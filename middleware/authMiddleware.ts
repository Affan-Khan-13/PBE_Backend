import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import ClientModel, { Client } from "../models/clientModel";
import CoachModel, { Coach } from "../models/CoachModel";

interface CustomJwtPayload extends JwtPayload {
  userId: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: Client | Coach; // Optional user property, as it may or may not be set
    }
  }
}

const protectClient = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) {
    res.status(401).json({ message: "Access Denied" });
    return;
  }
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET environment variable is not defined");
    }
    const verified = jwt.verify(token, process.env.JWT_SECRET);

    // Type guard: Ensure verified is an object and contains `userId`
    if (typeof verified === "object" && "userId" in verified) {
      const verifiedPayload = verified as CustomJwtPayload;
      const userId = verifiedPayload.userId;
      const user = await ClientModel.findById(userId);
      if (user) {
        req.user = user;
        next();
      } else {
        throw Error("Expired or Invalid token");
      }
    } else {
      throw Error("Expired or Invalid token");
    }
  } catch (e) {
    console.log(e);
    res.status(400).json({ message: "Not Authorized" });
  }
};

const protectCoach = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) {
    res.status(401).json({ message: "Access Denied" });
    return;
  }
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET environment variable is not defined");
    }
    const verified = jwt.verify(token, process.env.JWT_SECRET);

    // Type guard: Ensure verified is an object and contains `userId`
    if (typeof verified === "object" && "userId" in verified) {
      const verifiedPayload = verified as CustomJwtPayload;
      const userId = verifiedPayload.userId;
      const user = await CoachModel.findById(userId);
      if (user) {
        req.user = user;
        next();
      } else {
        throw Error("Expired or Invalid token");
      }
    } else {
      throw Error("Expired or Invalid token");
    }
  } catch (e) {
    console.log(e);
    res.status(400).json({ message: "Not Authorized" });
  }
};

export { protectClient, protectCoach };
