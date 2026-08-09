import prisma from "../../../lib/prisma.js";
import StatusCodes from "http-status-codes";

const getProductData = async (req, res) => {
  try {
    const products = await prisma.products.findMany({
      take: 20,
    });


    res.status(200).json({
      success: true,
      data: products,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch data",
    });
    console.log(err);
  }
};

export default getProductData;
