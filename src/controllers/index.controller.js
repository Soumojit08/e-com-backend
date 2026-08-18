import getProductsById from "./data/get/getProductById.controller.js";
import getProductData from "./data/get/getProductData.controller.js";

const controllers = {
  GetProductData: getProductData,
  GetProductById: getProductsById,
};

export default controllers;
