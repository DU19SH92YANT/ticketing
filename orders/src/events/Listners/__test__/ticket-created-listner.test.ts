import { TicketCreatedEvent } from "@dksticketing/common";
import { natsWrapper } from "../../../nats-wrapper";
import { TicketCreatedListener } from "../ticket-created-listner";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../../models/ticket";

jest.mock("../../../nats-wrapper");
const setup = async () => {
  const listner = new TicketCreatedListener(natsWrapper.client);
  const data: TicketCreatedEvent["data"] = {
    version: 0,
    id: new mongoose.Types.ObjectId().toHexString(),
    title: "concert",
    price: 10,
    userId: new mongoose.Types.ObjectId().toHexString(),
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listner, data, msg };
};

it("creates and saves a ticket", async () => {
  const { listner, data, msg } = await setup();
  await listner.onMessage(data, msg);
  const ticket = await Ticket.findById(data.id);
  expect(ticket).toBeDefined();
  expect(ticket!.title).toEqual(data.title);
  expect(ticket!.price).toEqual(data.price);
});

it("acks the message", async () => {
  const { data, listner, msg } = await setup();

  await listner.onMessage(data, msg);
  expect(msg.ack).toHaveBeenCalled();
});
