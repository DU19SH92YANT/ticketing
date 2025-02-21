import { Message } from "node-nats-streaming";
import mongoose from "mongoose";
import { Ticket } from "../../../models/ticket";
import { natsWrapper } from "../../../nats-wrapper";

import { OrderCancelledEvent } from "@dksticketing/common";
import { OrderCancelledListner } from "../order-cancelled-listner";

jest.mock("../../../nats-wrapper"); // Mock the NATS client

const setup = async () => {
  // Create an instance of the listener
  const listener = new OrderCancelledListner(natsWrapper.client);

  // Create a ticket with an associated orderId
  const orderId = new mongoose.Types.ObjectId().toHexString();
  const ticket = Ticket.build({
    title: "concert",
    price: 20,
    userId: "sfsfd",
  });

  ticket.set({ orderId }); // Attach orderId to the ticket
  await ticket.save();

  // Create a fake OrderCancelledEvent data object
  const data: OrderCancelledEvent["data"] = {
    id: orderId,
    version: 0,
    ticket: {
      id: ticket.id,
    },
  };

  // Mock NATS Message acknowledgment function
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, ticket, data, msg, orderId };
};

it("updates the ticket, publishes an event, and acknowledges the message", async () => {
  const { listener, ticket, data, msg } = await setup();

  await listener.onMessage(data, msg);

  // Fetch updated ticket from database
  const updatedTicket = await Ticket.findById(ticket.id);

  // Ensure the orderId is removed
  expect(updatedTicket!.orderId).toBeUndefined(); // or expect(updatedTicket!.orderId).toBeNull();
  expect(updatedTicket!.toObject()).not.toHaveProperty("orderId");

  // Ensure ack() is called to acknowledge message processing
  expect(msg.ack).toHaveBeenCalled();

  // Ensure a ticket updated event is published
  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
