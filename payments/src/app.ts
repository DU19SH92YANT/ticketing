import express from "express";
import "express-async-errors";
import { json } from "body-parser";

import { errorHandler, NotFoundError, currentUser } from "@dksticketing/common";
import { createChargeRouter } from "./routes/new";
const cors = require("cors");
const cookieParser = require("cookie-parser");

const app = express();
app.use(
  cors({
    origin: "http://ticketing.com", // ✅ Change to your frontend domain
    credentials: true, // ✅ Allow cookies to be sent
  })
);

app.use(cookieParser());
app.set("trust proxy", true);
app.use(json());
app.use(currentUser);

app.use(createChargeRouter);
app.all("*", async () => {
  throw new NotFoundError();
});
app.use(errorHandler);

export { app };
