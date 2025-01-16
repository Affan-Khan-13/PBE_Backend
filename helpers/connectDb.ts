import mongoose from "mongoose";

const connectDb = () => {
  const mongoUrl = process.env.MONGO_URL;

  if (!mongoUrl) {
    throw new Error("MONGO_URL is not defined in environment variables.");
  }
  mongoose
    .connect(mongoUrl)
    .then(() => console.log("Database Connected Successfully"))
    .catch((error) => console.log(error));
};

export default connectDb;
