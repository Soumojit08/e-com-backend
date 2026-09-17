import prisma from "../../../lib/prisma.js";

const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    const clerkId = req.userId;

    // 1. Validate input
    if (!productId) {
      return res.status(400).json({
        status: "failed",
        msg: "Invalid productId",
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

    // Find or create wishlist.
    const wishList = await prisma.wishList.upsert({
      where: {
        userId: user.id,
      },
      update: {},
      create: {
        userId: user.id,
      },
    });

    const wishListItem = await prisma.wishListItem.upsert({
      where: { wishListId_productId: { wishListId: wishList.id, productId } },
      update: {},
      create: { wishListId: wishList.id, productId },
    });

    return res.status(200).json({
      status: "success",
      msg: "Wishlist item added successfully",
      data: wishListItem,
    });
  } catch (error) {
    console.error("Error adding to wishlist:", error);

    return res.status(500).json({
      status: "failed",
      msg: "Could not add item to wishlist",
    });
  }
};

export default addToWishlist;
