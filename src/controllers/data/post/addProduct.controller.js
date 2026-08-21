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

    const parsedPrice = Number(price);

    if (
      !name ||
      !category ||
      price === undefined ||
      price === null ||
      price === "" ||
      !Number.isFinite(parsedPrice)
    ) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        msg: "name, category, and a valid price are required",
      });
    }

    const productItem = await prisma.products.create({
      data: {
        brand,
        category,
        name,
        price: parsedPrice,
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
