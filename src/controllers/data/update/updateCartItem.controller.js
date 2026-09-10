import prisma from "../../../lib/prisma.js";

const updateCartItem = async (req, res) => {
  try {
    const productId = Number(req.params.productId);
    const { quantity } = req.body;
    const clerkId = req.userId;

    // 1. Validate input
    if (
      !Number.isInteger(productId) ||
      !Number.isInteger(quantity) ||
      quantity <= 0
    ) {
      return res.status(400).json({
        status: "failed",
        msg: "Invalid productId or quantity",
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

    // Update existing item
    const updatedCartItem = await prisma.cartItem.update({
      where: {
        id: existingCartItem.id,
      },
      data: {
        quantity: quantity,
      },
    });

    return res.status(200).json({
      status: "success",
      msg: "Cart item quantity updated",
      data: updatedCartItem,
    });
  } catch (error) {
    console.error("Error updating cart item:", error);
    res.status(500).json({
      status: "failed",
      msg: "Cart item can't be updated",
      error: error,
    });
  }
};

export default updateCartItem;
