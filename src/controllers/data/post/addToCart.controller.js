import prisma from "../../../lib/prisma.js";

const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const clerkId = req.userId;

    // 1. Validate input
    if (!productId || !quantity || quantity <= 0) {
      return res.status(400).json({
        status: "failed",
        msg: "Invalid productId or quantity",
      });
    }

    // These lookups are independent and can share one database round-trip.
    const [user, product] = await Promise.all([
      prisma.user.findUnique({ where: { clerkId } }),
      prisma.products.findUnique({ where: { id: productId } }),
    ]);

    if (!user) {
      return res.status(404).json({ status: "failed", msg: "User not found" });
    }

    if (!product) {
      return res.status(404).json({
        status: "failed",
        msg: "Product not found",
      });
    }

    // Find or create cart.
    const cart = await prisma.cart.upsert({
      where: {
        userId: user.id,
      },
      update: {},
      create: {
        userId: user.id,
      },
    });

    const cartItem = await prisma.cartItem.upsert({
      where: { cartId_productId: { cartId: cart.id, productId } },
      update: { quantity: { increment: quantity } },
      create: { cartId: cart.id, productId, quantity },
    });

    return res.status(200).json({
      status: "success",
      msg: "Cart item added successfully",
      data: cartItem,
    });
  } catch (error) {
    console.error("Error adding to cart:", error);

    return res.status(500).json({
      status: "failed",
      msg: "Could not add item to cart",
    });
  }
};

export default addToCart;
