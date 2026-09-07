import prisma from "../../../lib/prisma.js";

const getCartData = async (req, res) => {
  try {
    const clerkId = req.userId;
    // 1. Find User
    const user = await prisma.user.findUnique({
      where: {
        clerkId: clerkId,
      },
    });
    if (!user) {
      return res.status(404).json({
        status: "failed",
        msg: "User not found",
      });
    }
    // 2. Find Cart
    const cart = await prisma.cart.findUnique({
      where: {
        userId: user.id,
      },
      // 3. Include cartItems + product
      include: {
        cartItems: {
          include: {
            product: true,
          },
        },
      },
    });
    if (!cart) {
      return res.status(200).json({
        status: "success",
        msg: "No cart item found for the user",
        data: null,
      });
    }

    const responseCart = {
      ...cart,
      userId: cart.userId.toString(),
    };
    console.log("responseCart", responseCart);

    // 4. Return response
    return res.status(200).json({
      status: "success",
      msg: "Cart data fetched successfully",
      data: responseCart,
    });
  } catch (error) {
    console.error("Error fetching cart data:", error);
    res.status(500).json({
      status: "failed",
      msg: "Cart data can't be fetched",
    });
  }
};

export default getCartData;
