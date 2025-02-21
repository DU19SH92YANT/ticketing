import { TicketUpdatedListener } from "./events/Listners/ticket-updated-listner";
import { TicketCreatedListener } from "./events/Listners/ticket-created-listner";

import mongoose from "mongoose";
import { app } from "./app";
import { natsWrapper } from "./nats-wrapper";
import { ExpirationCompleteListener } from "./events/Listners/expiration-complete-listner";
import { PaymentCreatedListener } from "./events/Listners/payment-created-listener";
const start = async () => {
  if (!process.env.JWT_KEY) {
    throw new Error("JWT_KET muxt be defined");
  }
  if (!process.env.MONGO_URI) {
    throw new Error("AUTH_URI muxt be defined");
  }
  if (!process.env.NATS_CLIENT_ID) {
    throw new Error("NATS_CLIENT_ID muxt be defined");
  }
  if (!process.env.NATS_URL) {
    throw new Error("NATS_URL muxt be defined");
  }
  if (!process.env.NATS_CLUSTER_ID) {
    throw new Error("NATS_CLUSTER_ID muxt be defined");
  }
  try {
    await natsWrapper.connect(
      process.env.NATS_CLUSTER_ID,
      process.env.NATS_CLIENT_ID,
      process.env.NATS_URL
    );

    natsWrapper.client.on("close", () => {
      console.log("NATS connection closed!");
      process.exit();
    });
    process.on("SIGINT", () => natsWrapper.client.close());
    process.on("SIGIERM", () => natsWrapper.client.close());
    new TicketCreatedListener(natsWrapper.client).listen();
    new TicketUpdatedListener(natsWrapper.client).listen();
    new PaymentCreatedListener(natsWrapper.client).listen();
    new ExpirationCompleteListener(natsWrapper.client).listen();
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDb");
  } catch (error) {
    console.log(error);
  }

  app.listen(3000, () => {
    console.log("listening  on port 3000!!!!!!!");
  });
};

start();
