import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

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

export const currentUser = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log(req.cookies?.jwt, "cookies");
  if (!req?.cookies?.jwt) {
    return next();
  }

  try {
    const payload = jwt.verify(
      req.cookies.jwt,
      process.env.JWT_KEY!
    ) as JwtPayload & UserPayload;
    delete payload.iat;
    req.currentUser = payload;
  } catch (error) {}

  next();
};
