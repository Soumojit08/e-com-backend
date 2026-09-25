import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const createRazorpayOrder = async (req, res) => {
  try {
    const { amount, currency = "INR", receipt = "order_rcptid_1" } = req.body;

    if (!amount || Number(amount) < 100) {
      return res.status(400).json({
        success: false,
        msg: "Amount must be at least 100 paise",
      });
    }

    const order = await razorpay.orders.create({
      amount: Number(amount),
      currency,
      receipt,
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
