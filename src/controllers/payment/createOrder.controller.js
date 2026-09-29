import prisma from "../../lib/prisma.js";
import createRazorpayClient from "../../lib/razorpay.js";
import { getCheckoutCart, OrderFlowError } from "../order/order.service.js";

const createRazorpayOrder = async (req, res) => {
  try {
    const { addressId, currency = "INR" } = req.body ?? {};
    const parsedAddressId = Number(addressId);

    if (!Number.isInteger(parsedAddressId) || parsedAddressId <= 0) {
      return res.status(400).json({
        success: false,
        msg: "Select a valid delivery address",
      });
    }

    const address = await prisma.address.findFirst({
      where: {
        id: parsedAddressId,
        user: { clerkId: req.userId },
      },
      select: { id: true },
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        msg: "Delivery address not found",
      });
    }

    const { total } = await getCheckoutCart(prisma, req.userId);
    const amount = Math.round(total * 100);

    const order = await createRazorpayClient().orders.create({
      amount,
      currency,
      receipt: `receipt_${Date.now()}`,
      notes: {
        clerkId: req.userId,
        addressId: String(parsedAddressId),
      },
    });

    return res.status(200).json({
      success: true,
      data: {
        order_id: order.id,
        amount: order.amount,
        currency: order.currency,
      },
    });
  } catch (error) {
    if (error instanceof OrderFlowError) {
      return res.status(error.statusCode).json({
        success: false,
        msg: error.message,
      });
    }

    console.error("Razorpay create order error:", error);

    if (error?.statusCode === 401) {
      return res.status(401).json({
        success: false,
        msg: "Razorpay authentication failed",
      });
    }

    return res.status(500).json({
      success: false,
      msg: "Could not create Razorpay order",
    });
  }
};

export default createRazorpayOrder;
