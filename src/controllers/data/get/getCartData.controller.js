import prisma from "../../../lib/prisma.js";

const getCartData = async (req, res) => {
  try {
    const clerkId = req.userId;
    const cart = await prisma.cart.findFirst({
      where: {
        user: { clerkId },
      },
      select: {
        id: true,
        userId: true,
        cartItems: {
          select: {
            productId: true,
            quantity: true,
            product: {
              select: {
                name: true,
                brand: true,
                category: true,
                price: true,
                image_url: true,
              },
            },
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
    // Return response
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
