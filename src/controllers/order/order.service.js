import { randomUUID } from "node:crypto";
import prisma from "../../lib/prisma.js";

export class OrderFlowError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

export const getCheckoutCart = async (db, clerkId) => {
  const cart = await db.cart.findFirst({
    where: { user: { clerkId } },
    include: {
      cartItems: {
        include: {
          product: {
            select: { id: true, name: true, price: true },
          },
        },
      },
    },
  });

  if (!cart?.cartItems.length) {
    throw new OrderFlowError("Your cart is empty", 400);
  }

  const items = cart.cartItems.map((cartItem) => {
    const price = Number(cartItem.product.price);
    if (
      cartItem.product.price == null ||
      !Number.isFinite(price) ||
      price <= 0 ||
      cartItem.quantity < 1
    ) {
      throw new OrderFlowError("Your cart contains an invalid item", 400);
    }

    return {
      productId: cartItem.productId,
      quantity: cartItem.quantity,
      price,
    };
  });

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const delivery = subtotal >= 5000 ? 0 : 99;

  return { cart, items, subtotal, total: subtotal + delivery };
};

export const persistCheckoutOrder = async ({
  clerkId,
  addressId,
  paymentMethod,
  paymentStatus,
  razorpayOrderId = null,
  expectedAmountPaise,
}) =>
  prisma.$transaction(async (tx) => {
    if (razorpayOrderId) {
      const existingOrder = await tx.order.findUnique({
        where: { razorpayOrderId },
        include: {
          user: { select: { clerkId: true } },
          orderItems: { include: { product: true } },
        },
      });

      if (existingOrder) {
        if (existingOrder.user.clerkId !== clerkId) {
          throw new OrderFlowError(
            "Payment order does not belong to this user",
            403,
          );
        }
        return existingOrder;
      }
    }

    const user = await tx.user.findUnique({
      where: { clerkId },
      select: { id: true, name: true },
    });

    if (!user) {
      throw new OrderFlowError("User not found", 404);
    }

    const parsedAddressId = Number(addressId);
    if (!Number.isInteger(parsedAddressId) || parsedAddressId <= 0) {
      throw new OrderFlowError("Select a valid delivery address", 400);
    }

    const address = await tx.address.findFirst({
      where: { id: parsedAddressId, userId: user.id },
    });

    if (!address) {
      throw new OrderFlowError("Delivery address not found", 404);
    }

    const { cart, items, total } = await getCheckoutCart(tx, clerkId);
    if (
      expectedAmountPaise != null &&
      Math.round(total * 100) !== Number(expectedAmountPaise)
    ) {
      throw new OrderFlowError(
        "Cart total changed. Please restart payment",
        409,
      );
    }

    const orderData = {
      order_id: `ORD-${Date.now()}-${randomUUID().slice(0, 8)}`,
      user_id: user.id,
      status: "Placed",
      paymentStatus,
      paymentMethod,
      total,
      shippingAddress: {
        name: address.name ?? user.name ?? "User",
        phone: address.phone ?? "",
        address: address.address ?? address.city,
        city: address.city,
        state: address.state ?? address.country,
        country: address.country,
        pincode: address.pincode,
      },
      razorpayOrderId,
      orderItems: {
        create: items.map((item) => ({
          product_id: item.productId,
          quantity: item.quantity,
          uniPrice: item.price,
          discountedPrice: item.price,
        })),
      },
    };

    const order = razorpayOrderId
      ? await tx.order.upsert({
          where: { razorpayOrderId },
          update: {},
          create: orderData,
          include: { orderItems: { include: { product: true } } },
        })
      : await tx.order.create({
          data: orderData,
          include: { orderItems: { include: { product: true } } },
        });

    if (order.user_id !== user.id) {
      throw new OrderFlowError(
        "Payment order does not belong to this user",
        403,
      );
    }

    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
    return order;
  });

export const serializeOrder = (order) => ({
  id: order.id,
  orderId: order.order_id,
  status: order.status,
  paymentStatus: order.paymentStatus,
  paymentMethod: order.paymentMethod,
  total: Number(order.total),
  shippingAddress: order.shippingAddress,
  createdAt: order.createdAt,
  items: order.orderItems.map((item) => ({
    id: item.id,
    productId: item.product_id,
    name: item.product.name,
    quantity: item.quantity,
    price: Number(item.discountedPrice) * item.quantity,
  })),
});
