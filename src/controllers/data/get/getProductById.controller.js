import prisma from "../../../lib/prisma.js";
import StatusCodes from "http-status-codes";

const getProductsById = async (req, res) => {
  try {
    const productId = Number(req.params.id);

    const product = await prisma.products.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch data",
    });
    console.log(error);
  }
};

export default getProductsById;
