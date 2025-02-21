import express, { Response, Request } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { currentUser } from "@dksticketing/common";
import { requireAuth } from "@dksticketing/common";
const router = express.Router();

router.get(
  "/api/users/currentUser",
  currentUser,
  requireAuth,
  async (req: Request, res: Response): Promise<any> => {
    res.send({ currentUser: req.currentUser || null });
  }
);

export { router as currentUserRouter };
