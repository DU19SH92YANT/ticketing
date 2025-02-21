import express, { Response, Request } from "express";
import { body } from "express-validator";
import { validationRequest } from "@dksticketing/common";
import { User } from "../model/user";
import { BadRequestError } from "@dksticketing/common";
import jwt from "jsonwebtoken";
const router = express.Router();

router.post(
  "/api/users/signin",
  [
    body("email").isEmail().withMessage("Email must be valid"),
    body("password")
      .trim()
      .notEmpty()
      .withMessage("You must supply a password"),
  ],
  validationRequest,
  async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      throw new BadRequestError("Invalid credentials");
    }
    const passwordMatch = await existingUser.comparePassword(password);
    if (!passwordMatch) {
      throw new BadRequestError("Invalid Credentials");
    }

    const userJwt = jwt.sign(
      { id: existingUser._id, email: existingUser.email },
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
      .send(existingUser);
  }
);

export { router as signinRouter };
