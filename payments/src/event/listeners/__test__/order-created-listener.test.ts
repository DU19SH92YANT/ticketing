import {
  OrderCancelledEvent,
  OrderCreatedEvent,
  OrderStatus,
} from "@dksticketing/common";
import { natsWrapper } from "../../../nats-wrapper";
import { OrderCreatedListner } from "../order-created-listener";
import mongoose from "mongoose";
import { Order } from "../../../models/order";

jest.mock("../../../nats-wrapper");
const setup = async () => {
  const listener = new OrderCreatedListner(natsWrapper.client);

  const data: OrderCreatedEvent["data"] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    expiresAt: "jjjj",
    userId: "dfsfdfs",
    status: OrderStatus.Created,
    ticket: {
      id: "sgsdf",
      price: 10,
    },
  };

  //   @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, data, msg };
};

it("replicates the order info", async () => {
  const { listener, data, msg } = await setup();
  await listener.onMessage(data, msg);

  const order = await Order.findById(data.id);
  expect(order!.price).toEqual(data.ticket.price);
});

it("acks the message", async () => {
  const { listener, data, msg } = await setup();
  await listener.onMessage(data, msg);
  expect(msg.ack).toHaveBeenCalled();
});
