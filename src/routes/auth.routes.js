import express from "express";
import { getAuth } from "@clerk/express";

const router = express.Router();

router.get("/test", (req, res) => {
  const { userId, isAuthenticated } = getAuth(req);

  if (!isAuthenticated) {
    return res.status(401).json({
      success: false,
      msg: "User is not authorized",
    });
  }

  return res.status(200).json({
    success: true,
    msg: "User Authorized",
    userId,
  });
});

export default router;
