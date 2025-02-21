import express from "express";
import "express-async-errors";
import { json } from "body-parser";
import { currentUserRouter } from "./Routes/current-user";
import { signinRouter } from "./Routes/Signin";
import { signupRouter } from "./Routes/signup";
import { signoutRouter } from "./Routes/signout";
import { errorHandler } from "@dksticketing/common";
import { NotFoundError } from "@dksticketing/common";
import cookieSession from "cookie-session";
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

app.use(currentUserRouter);
app.use(signinRouter);
app.use(signupRouter);
app.use(signoutRouter);
app.all("*", async () => {
  throw new NotFoundError();
});
app.use(errorHandler);

export { app };
