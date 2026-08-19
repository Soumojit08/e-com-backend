import prisma from "../../../lib/prisma.js";
import { StatusCodes } from "http-status-codes";

const addProduct = async (req, res) => {
  try {
    const {
      brand,
      category,
      name,
      price,
      rating_count,
      image_url,
      metadata_specs,
    } = req.body ?? {};

    const productItem = await prisma.products.create({
      data: {
        brand,
        category,
        name,
        price,
        rating_count,
        image_url,
        metadata_specs,
      },
    });

    res.status(StatusCodes.CREATED).send({
      msg: "Product added to database",
      product: productItem,
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      msg: "Error in creating product",
      error: error,
    });
    console.log(error);
  }
};

export default addProduct;
