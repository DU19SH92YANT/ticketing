import express, { Request, Response } from "express";
import { body } from "express-validator";
import {
  requireAuth,
  validationRequest,
  BadRequestError,
  NotAuthorizedError,
  NotFoundError,
  OrderStatus,
} from "@dksticketing/common";
import { Order } from "../models/order";
import { stripe } from "../stripe";
import { Payment } from "../models/payment";
import { PaymentCreatedPublisher } from "../event/publishers/payment-created-publisher";
import { natsWrapper } from "../nats-wrapper";
import mongoose from "mongoose";

const router = express.Router();

router.post(
  "/api/payments",
  requireAuth,
  [
    body("token").not().isEmpty().withMessage("Token is required"),
    body("orderId").not().isEmpty().withMessage("Order ID is required"),
  ],
  validationRequest,
  async (req: Request, res: Response) => {
    const { token, orderId } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      throw new NotFoundError();
    }
    if (order.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }
    if (order.status === OrderStatus.Cancelled) {
      throw new BadRequestError("Cannot pay for a cancelled order");
    }

    // ✅ Fix: Use `source: token` instead of `payment_method`
    // const charge = await stripe.charges.create({
    //   amount: order.price * 100, // Convert INR to paise
    //   currency: "inr",
    //   source: token, // ✅ Use token correctly
    //   description: `Payment for order ${orderId}`,
    // });

    // console.log(charge, "payment");
    let chargeId = new mongoose.Types.ObjectId().toHexString();

    const payment = Payment.build({
      orderId,
      stripeId: chargeId,
    });

    await payment.save();

    new PaymentCreatedPublisher(natsWrapper.client).publish({
      id: payment.id,
      orderId,
      stripeId: chargeId,
    });

    res.status(201).send({ id: payment.id });
  }
);

export { router as createChargeRouter };
