import express from "express";
import "express-async-errors";
import { json } from "body-parser";

import { errorHandler, NotFoundError, currentUser } from "@dksticketing/common";
import { indexOrderRouter } from "./routes";
import { newOrderRouter } from "./routes/new";
import { showOrderRouter } from "./routes/show";

import { deleteOrderRouter } from "./routes/delete";
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

app.use(deleteOrderRouter);
app.use(indexOrderRouter);
app.use(showOrderRouter);
app.use(newOrderRouter);
app.all("*", async () => {
  throw new NotFoundError();
});
app.use(errorHandler);

export { app };
