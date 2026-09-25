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

// cart routes
router.get("/cart", requireAuth, controllers.GetCartData);
router.post("/cart/items", requireAuth, controllers.AddToCart);
router.patch("/cart/items/:productId", requireAuth, controllers.UpdateCartItem);
router.delete("/cart/items/:productId", requireAuth, controllers.RemoveCartItem);

// address routes
router.get("/addresses", requireAuth, controllers.GetUserAddresses);
router.post("/addresses", requireAuth, controllers.SaveUserAddress);

// payment routes
router.post("/create-order", requireAuth, controllers.CreateRazorpayOrder);
router.post("/verify-payment", requireAuth, controllers.VerifyRazorpayPayment);

//wishlist routes

//Get
router.get("/wishlist", requireAuth, controllers.GetWishlistData);

//Post (add item)
router.post("/wishlist/items", requireAuth, controllers.AddToWishlist);

//Delete (remove item)
router.delete(
  "/wishlist/items/:productId",
  requireAuth,
  controllers.RemoveWishlistItem,
);

export default router;
