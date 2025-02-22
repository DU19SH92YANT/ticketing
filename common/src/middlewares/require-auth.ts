import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface UserPayload {
  id: string;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      currentUser?: UserPayload;
    }
  }
}

export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // ✅ Extract JWT from cookies instead of session
  const token = req.cookies?.jwt;

  if (!token) {
    console.log("No JWT found in cookies");
    return next();
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_KEY!) as UserPayload;
    req.currentUser = payload; // ✅ Set user in request
    console.log("User authenticated:", req.currentUser);
  } catch (err) {
    console.error("JWT Verification Failed:", err);
  }

  next();
};
