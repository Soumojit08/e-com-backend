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

    // 2. Find user
    const user = await prisma.user.findUnique({
      where: {
        clerkId,
      },
    });

    if (!user) {
      return res.status(404).json({
        status: "failed",
        msg: "User not found",
      });
    }

    // 3. Check product exists
    const product = await prisma.products.findUnique({
      where: {
        id: productId,
      },
    });

    if (!product) {
      return res.status(404).json({
        status: "failed",
        msg: "Product not found",
      });
    }

    // 4. Find or create cart
    const cart = await prisma.cart.findUnique({
      where: {
        userId: user.id,
      },
    });

    if (!cart) {
      return res.status(404).json({
        status: "failed",
        msg: "Cart not found",
      });
    }

    // 5. Check if product already exists in cart
    const existingCartItem = await prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId,
        },
      },
    });

    if (!existingCartItem) {
      return res.status(404).json({
        status: "failed",
        msg: "Product not found in cart",
      });
    }

    // 6. Update existing item
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
