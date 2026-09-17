import prisma from "../../../lib/prisma.js";

const getWishList = async (req, res) => {
  try {
    const clerkId = req.userId;
    const wishList = await prisma.wishList.findFirst({
      where: {
        user: { clerkId },
      },
      select: {
        id: true,
        userId: true,
        wishListItems: {
          select: {
            productId: true,
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
    if (!wishList) {
      return res.status(200).json({
        status: "success",
        msg: "No wishlist item found for the user",
        data: null,
      });
    }

    const responseWishList = {
      ...wishList,
      userId: wishList.userId.toString(),
    };
    // Return response
    return res.status(200).json({
      status: "success",
      msg: "Wishlist data fetched successfully",
      data: responseWishList,
    });
  } catch (error) {
    console.error("Error fetching wishlist data:", error);
    res.status(500).json({
      status: "failed",
      msg: "Wishlist data can't be fetched",
    });
  }
};

export default getWishList;
