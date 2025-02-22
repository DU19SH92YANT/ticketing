import mongoose from "mongoose";
import { app } from "./app";

const start = async () => {
  console.log("startin auth....");
  if (!process.env.JWT_KEY) {
    throw new Error("JWT_KET muxt be defined");
  }
  if (!process.env.MONGH_URI) {
    throw new Error("MONGH_URI muxt be defined");
  }
  try {
    await mongoose.connect(process.env.MONGH_URI);
    console.log("Connected to MongoDb");
  } catch (error) {
    console.log(error);
  }

  app.listen(3000, () => {
    console.log("listening  on port 3000!!!!!!!");
  });
};

start();
