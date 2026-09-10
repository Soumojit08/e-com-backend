import prisma from "../../../lib/prisma.js";

const removeCartItem = async (req, res) => {
  try {
    const productId = Number(req.params.productId);
    const clerkId = req.userId;

    // 1. Validate input
    if (!Number.isInteger(productId)) {
      return res.status(400).json({
        status: "failed",
        msg: "Invalid productId",
      });
    }

    // Find the item through the authenticated user's cart.
    const existingCartItem = await prisma.cartItem.findFirst({
      where: {
        productId,
        cart: { user: { clerkId } },
      },
    });

    if (!existingCartItem) {
      return res.status(404).json({
        status: "failed",
        msg: "Product not found in cart",
      });
    }

    // Remove existing item
    const removedCartItem = await prisma.cartItem.delete({
      where: {
        id: existingCartItem.id,
      },
    });

    return res.status(200).json({
      status: "success",
      msg: "Cart item removed successfully",
      data: removedCartItem,
    });
  } catch (error) {
    console.error("Error removing cart item:", error);
    res.status(500).json({
      status: "failed",
      msg: "Cart item can't be removed",
      error: error,
    });
  }
};

export default removeCartItem;
