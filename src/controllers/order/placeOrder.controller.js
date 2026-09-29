import {
  OrderFlowError,
  persistCheckoutOrder,
  serializeOrder,
} from "./order.service.js";

const placeOrder = async (req, res) => {
  try {
    const order = await persistCheckoutOrder({
      clerkId: req.userId,
      addressId: req.body?.addressId,
      paymentMethod: "cod",
      paymentStatus: "Pending",
    });

    return res.status(201).json({
      status: "success",
      msg: "Order placed successfully",
      data: serializeOrder(order),
    });
  } catch (error) {
    if (error instanceof OrderFlowError) {
      return res.status(error.statusCode).json({
        status: "failed",
        msg: error.message,
      });
    }

    console.error("Error placing COD order:", error);
    return res.status(500).json({
      status: "failed",
      msg: "Could not place order",
    });
  }
};

export default placeOrder;
