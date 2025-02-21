import { Request, Response, NextFunction } from "express";
import { RequestValidationError } from "../errors/request-validateion-errors";
import { validationResult } from "express-validator";

export const validationRequest = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new RequestValidationError(errors.array());
  }

  next();
};
