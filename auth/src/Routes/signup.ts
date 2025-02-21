import { validationRequest } from "@dksticketing/common";
import express, { Request, Response } from "express";
import { body } from "express-validator";

import { User } from "../model/user";
import jwt from "jsonwebtoken";
import { BadRequestError } from "@dksticketing/common";
const router = express.Router();

router.post(
  "/api/users/signup",
  [
    body("email").isEmail().withMessage("email must be valid"),
    body("password")
      .trim()
      .isLength({ min: 4, max: 20 })
      .withMessage("Password must be between 4 and 20 characters"),
  ],
  validationRequest,
  async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      throw new BadRequestError("Email in use");
    }

    const user = User.build({ email, password });
    await user.save();

    const userJwt = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_KEY!
    );

    res
      .status(201)
      .cookie("jwt", userJwt, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "test", // Use HTTPS only in production
        sameSite: "lax", // Ensures cookie is sent for same-site requests
        path: "/", // Ensures cookie is available site-wide
        maxAge: 24 * 60 * 60 * 1000, // 1-day expiry
      })
      .send(user);
  }
);

export { router as signupRouter };
