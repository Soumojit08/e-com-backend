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
    const cart = await prisma.cart.upsert({
      where: {
        userId: user.id,
      },
      update: {},
      create: {
        userId: user.id,
      },
    });

    // 5. Check if product already exists in cart
    const existingCartItem = await prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId,
        },
      },
    });

    // 6. Update existing item
    if (existingCartItem) {
      const updatedCartItem = await prisma.cartItem.update({
        where: {
          id: existingCartItem.id,
        },
        data: {
          quantity: existingCartItem.quantity + quantity,
        },
      });

      return res.status(200).json({
        status: "success",
        msg: "Cart item quantity updated",
        data: updatedCartItem,
      });
    }

    // 7. Create new cart item
    const newCartItem = await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId,
        quantity,
      },
    });

    return res.status(201).json({
      status: "success",
      msg: "Item added to cart successfully",
      data: newCartItem,
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
