import prisma from "../../../lib/prisma.js";

const removeWishListItem = async (req, res) => {
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
    const existingWishListItem = await prisma.wishListItem.findFirst({
      where: {
        productId,
        wishList: { user: { clerkId } },
      },
    });

    if (!existingWishListItem) {
      return res.status(404).json({
        status: "failed",
        msg: "Product not found in wishlist",
      });
    }

    // Remove existing item
    const removedWishListItem = await prisma.wishListItem.delete({
      where: {
        id: existingWishListItem.id,
      },
    });

    return res.status(200).json({
      status: "success",
      msg: "Wishlist item removed successfully",
      data: removedWishListItem,
    });
  } catch (error) {
    console.error("Error removing wishlist item:", error);
    res.status(500).json({
      status: "failed",
      msg: "Wishlist item can't be removed",
      error: error,
    });
  }
};

export default removeWishListItem;
