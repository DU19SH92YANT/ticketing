import express from "express";
import "express-async-errors";
import { json } from "body-parser";

import { errorHandler, NotFoundError, currentUser } from "@dksticketing/common";
import { indexTicketRouter } from "./routes";
import { createTicketRouter } from "./routes/new";
import { showTicketsRouter } from "./routes/show";
import { updateTicketRouter } from "./routes/update";
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

app.use(createTicketRouter);
app.use(showTicketsRouter);
app.use(indexTicketRouter);
app.use(updateTicketRouter);
app.all("*", async () => {
  throw new NotFoundError();
});
app.use(errorHandler);

export { app };
