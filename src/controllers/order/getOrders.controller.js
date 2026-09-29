import prisma from "../../lib/prisma.js";
import { serializeOrder } from "./order.service.js";

const getOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { user: { clerkId: req.userId } },
      orderBy: { createdAt: "desc" },
      include: { orderItems: { include: { product: true } } },
    });

    return res.status(200).json({
      status: "success",
      data: orders.map(serializeOrder),
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return res.status(500).json({
      status: "failed",
      msg: "Could not fetch orders",
    });
  }
};

export default getOrders;
