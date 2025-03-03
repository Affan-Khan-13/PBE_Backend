import express, { Request, Response } from "express";
import morgan from "morgan";
import cors from "cors";
import clientRoute from "./routes/clientRoute";
import coachRoute from "./routes/coachRoute";
import adminRoute from "./routes/adminRoute";
import connectDb from "./helpers/connectDb";
import dotenv from "dotenv";
import { swaggerUi, swaggerSpec } from "./swagger";
dotenv.config();
const port = process.env.PORT || "8000";

connectDb();

const app = express();

//middlewares
app.use(morgan("tiny"));
app.use(cors());
app.use(express.json());

//routes
app.use("/client", clientRoute);
app.use("/coach", coachRoute);
app.use("/admin", adminRoute);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/", (req: Request, res: Response) => {
  res.send("Server is running succesfully");
});

app.listen(port, () => {
  console.log("server running");
});
