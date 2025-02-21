import express from "express";

const router = express.Router();

router.get("/api/users/signout", (req, res) => {
  res.status(200).cookie("jwt", null, { httpOnly: true }).send({});
});

export { router as signoutRouter };
