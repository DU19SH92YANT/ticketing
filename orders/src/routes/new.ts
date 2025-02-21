import express, { Request, Response } from "express";
import {
  BadRequestError,
  NotFoundError,
  OrderStatus,
  requireAuth,
  validationRequest,
} from "@dksticketing/common";
import { body } from "express-validator";
import mongoose from "mongoose";
import { Ticket } from "../models/ticket";
import { Order } from "../models/orders";
import { OrderCreatedPublisher } from "../events/publishers/order-created-publisher";
import { natsWrapper } from "../nats-wrapper";

const router = express.Router();

const EXPIRATION_WINDOW_SECONDS = 1 * 60; // 15 minutes in seconds

router.post(
  "/api/orders",
  requireAuth,
  [
    body("ticketId")
      .not()
      .isEmpty()
      .custom((input: string) => mongoose.Types.ObjectId.isValid(input))
      .withMessage("TicketId must be provided"),
  ],
  validationRequest,
  async (req: Request, res: Response) => {
    const { ticketId } = req.body;
    console.log(ticketId, "sdsdssd");

    // Find the ticket that the user is trying to order
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      console.error("❌ Ticket not found:", ticketId);
      throw new NotFoundError();
    }

    // Check if the ticket is already reserved
    const isReserved = await ticket.isReserved();
    if (isReserved) {
      console.error("❌ Ticket is already reserved:", ticketId);
      throw new BadRequestError("Ticket is already reserved");
    }

    // Calculate an expiration date for this order
    const expiration = new Date();
    expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS);

    // Build the order and save it to the database
    const order = Order.build({
      userId: req.currentUser!.id,
      status: OrderStatus.Created,
      expiresAt: expiration,
      ticket,
    });
    await order.save();

    // Publish an event that an order was created
    try {
      await new OrderCreatedPublisher(natsWrapper.client).publish({
        id: order.id,
        status: order.status,
        userId: order.userId,
        version: order.version,
        expiresAt: order.expiresAt.toISOString(),
        ticket: {
          id: ticket.id,
          price: ticket.price,
        },
      });

      console.log("✅ Order Created Event Published:", order.id);
    } catch (error) {
      console.error("❌ Error publishing Order Created event:", error);
    }

    res.status(201).send(order);
  }
);

export { router as newOrderRouter };
