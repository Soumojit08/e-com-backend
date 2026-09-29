import crypto from "crypto";
import createRazorpayClient from "../../lib/razorpay.js";
import {
  OrderFlowError,
  persistCheckoutOrder,
  serializeOrder,
} from "../order/order.service.js";

const verifyRazorpayPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      addressId,
    } = req.body ?? {};

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      !addressId
    ) {
      return res.status(400).json({
        success: false,
        msg: "Missing payment or delivery details",
      });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      return res.status(500).json({
        success: false,
        msg: "Razorpay is not configured",
      });
    }

    const generatedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const generatedBuffer = Buffer.from(generatedSignature, "hex");
    const receivedBuffer = Buffer.from(razorpay_signature, "hex");
    if (
      generatedBuffer.length !== receivedBuffer.length ||
      !crypto.timingSafeEqual(generatedBuffer, receivedBuffer)
    ) {
      return res.status(400).json({
        success: false,
        msg: "Payment verification failed",
      });
    }

    const razorpay = createRazorpayClient();
    const [providerOrder, payment] = await Promise.all([
      razorpay.orders.fetch(razorpay_order_id),
      razorpay.payments.fetch(razorpay_payment_id),
    ]);

    if (
      providerOrder.notes?.clerkId !== req.userId ||
      Number(providerOrder.notes?.addressId) !== Number(addressId) ||
      providerOrder.currency !== "INR" ||
      payment.order_id !== razorpay_order_id ||
      payment.status !== "captured"
    ) {
      return res.status(400).json({
        success: false,
        msg: "Payment details do not match this checkout",
      });
    }

    const order = await persistCheckoutOrder({
      clerkId: req.userId,
      addressId,
      paymentMethod: "razorpay",
      paymentStatus: "Paid",
      razorpayOrderId: razorpay_order_id,
      expectedAmountPaise: providerOrder.amount,
    });

    return res.status(200).json({
      success: true,
      msg: "Payment verified and order placed successfully",
      data: {
        ...serializeOrder(order),
        razorpayPaymentId: razorpay_payment_id,
      },
    });
  } catch (error) {
    if (error instanceof OrderFlowError) {
      return res.status(error.statusCode).json({
        success: false,
        msg: error.message,
      });
    }

    console.error("Razorpay verify payment error:", error);
    return res.status(500).json({
      success: false,
      msg: "Could not verify payment",
    });
  }
};

export default verifyRazorpayPayment;
