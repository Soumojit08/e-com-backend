import crypto from "crypto";

const verifyRazorpayPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        msg: "Missing payment verification fields",
      });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    const generatedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        msg: "Payment verification failed",
      });
    }

    return res.status(200).json({
      success: true,
      msg: "Payment verified successfully",
      data: {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
      },
    });
  } catch (error) {
    console.error("Razorpay verify payment error:", error);
    return res.status(500).json({
      success: false,
      msg: "Could not verify payment",
    });
  }
};

export default verifyRazorpayPayment;
