import { Message } from "node-nats-streaming";
import { OrderCreatedEvent } from "./../../../../../common/src/events/order-created-event";
import { OrderCreatedListner } from "../order-created-listner";
import { natsWrapper } from "../../../nats-wrapper";
import { Ticket } from "../../../models/ticket";
import mongoose from "mongoose";
import { OrderStatus } from "@dksticketing/common";

jest.mock("../../../nats-wrapper");

const setup = async () => {
  const listner = new OrderCreatedListner(natsWrapper.client);
  const ticket = Ticket.build({
    title: "concert",
    price: 99,
    userId: "sgdsf",
  });

  await ticket.save();

  const data: OrderCreatedEvent["data"] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    status: OrderStatus.Created,
    userId: "sfsdfsdf",
    expiresAt: "efeif",
    ticket: {
      id: ticket.id,
      price: ticket.price,
    },
  };

  //   @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listner, ticket, data, msg };
};

it("sets the userId of the ticket", async () => {
  const { listner, ticket, data, msg } = await setup();
  await listner.onMessage(data, msg);
  const updatedTicket = await Ticket.findById(ticket.id);
  expect(updatedTicket!.orderId).toEqual(data.id);
});

it("acks the message", async () => {
  const { listner, ticket, data, msg } = await setup();
  await listner.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});

it("publisher a ticket updated event", async () => {
  const { listner, ticket, data, msg } = await setup();
  await listner.onMessage(data, msg);

  expect(natsWrapper.client.publish).toHaveBeenCalled();

  const ticketUpdatedData = JSON.parse(
    (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
  );

  expect(data.id).toEqual(ticketUpdatedData.orderId);
});
