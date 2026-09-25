import prisma from "../../../lib/prisma.js";

const getUserAddresses = async (req, res) => {
  try {
    const clerkId = req.userId;

    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: {
        id: true,
        name: true,
        phone_no: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        status: "failed",
        msg: "User not found",
      });
    }

    const addresses = await prisma.address.findMany({
      where: {
        userId: user.id,
      },
      orderBy: [{ isDefault: "desc" }, { id: "asc" }],
      select: {
        id: true,
        city: true,
        pincode: true,
        country: true,
        phone: true,
        isDefault: true,
      },
    });

    const normalizedAddresses = addresses.map((address) => ({
      id: Number(address.id),
      label: address.isDefault ? "Default" : "Saved address",
      name: user.name ?? "User",
      phone: address.phone ?? user.phone_no ?? "",
      address: address.city,
      city: address.city,
      state: address.country,
      pincode: address.pincode,
      country: address.country,
      isDefault: address.isDefault,
    }));

    return res.status(200).json({
      status: "success",
      msg: "Addresses fetched successfully",
      data: normalizedAddresses,
    });
  } catch (error) {
    console.error("Error fetching user addresses:", error);
    return res.status(500).json({
      status: "failed",
      msg: "Could not fetch addresses",
    });
  }
};

export default getUserAddresses;
