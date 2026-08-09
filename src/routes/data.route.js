import express from "express";

const router = express.Router();

router.get("/data-health", (req, res) => {
  res.send("data route is healthy");
});

export default router;
