import express from "express";
import controllers from "../controllers/index.controller.js";
import requireAuth from "../middlewares/requireAuth.js";

const router = express.Router();

router.get("/data-health", (req, res) => {
  res.send("data route is healthy");
});

// Get products from db
router.get("/get-product", controllers.GetProductData);
//get products with id
router.get("/get-product/:id", controllers.GetProductById);

//post product
router.post("/add-product", requireAuth, controllers.AddProduct);

export default router;
