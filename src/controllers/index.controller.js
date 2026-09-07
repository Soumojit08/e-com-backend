import getProductsById from "./data/get/getProductById.controller.js";
import getProductData from "./data/get/getProductData.controller.js";
import addProduct from "./data/post/addProduct.controller.js";
import getCartData from "./data/get/getCartData.controller.js";
import addToCart from "./data/post/addToCart.controller.js";
import updateCartItem from "./data/update/updateCartItem.controller.js";
import removeCartItem from "./data/delete/removeCartItem.controller.js";

const controllers = {
  GetProductData: getProductData,
  GetProductById: getProductsById,
  AddProduct: addProduct,
  GetCartData: getCartData,
  AddToCart: addToCart,
  UpdateCartItem: updateCartItem,
  RemoveCartItem: removeCartItem,
};

export default controllers;
