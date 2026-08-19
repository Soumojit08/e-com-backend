import getProductsById from "./data/get/getProductById.controller.js";
import getProductData from "./data/get/getProductData.controller.js";
import addProduct from "./data/post/addProduct.controller.js";

const controllers = {
  GetProductData: getProductData,
  GetProductById: getProductsById,
  AddProduct: addProduct,
};

export default controllers;
