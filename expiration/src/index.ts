import { app } from "./app";
import { OrderCreatedListener } from "./event/listener/order-created-listener";
import { natsWrapper } from "./nats-wrapper";
import { OrderCreatedEvent } from "@dksticketing/common";
const start = async () => {
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
    new OrderCreatedListener(natsWrapper.client).listen();
  } catch (error) {
    console.log(error);
  }

  app.listen(3000, () => {
    console.log("listening  on port 3000!!!!!!!");
  });
};

start();
