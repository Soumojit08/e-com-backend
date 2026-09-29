import prisma from "../../../lib/prisma.js";

const saveUserAddress = async (req, res) => {
  try {
    const clerkId = req.userId;
    const {
      name,
      address: streetAddress,
      city,
      state,
      pincode,
      country,
      phone,
      isDefault = false,
    } = req.body;

    if (
      !name ||
      !streetAddress ||
      !city ||
      !state ||
      !pincode ||
      !country ||
      !phone
    ) {
      return res.status(400).json({
        status: "failed",
        msg: "Complete delivery address and contact details are required",
      });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true },
    });

    if (!user) {
      return res.status(404).json({
        status: "failed",
        msg: "User not found",
      });
    }

    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: user.id, isDefault: true },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.create({
      data: {
        name,
        address: streetAddress,
        city,
        state,
        pincode: String(pincode),
        country,
        phone: String(phone),
        isDefault,
        userId: user.id,
      },
    });

    const safeAddress = {
      id: Number(address.id),
      name: address.name,
      address: address.address,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      country: address.country,
      phone: address.phone,
      isDefault: address.isDefault,
      userId: String(address.userId),
    };

    return res.status(201).json({
      status: "success",
      msg: "Address saved successfully",
      data: safeAddress,
    });
  } catch (error) {
    console.error("Error saving user address:", error);
    return res.status(500).json({
      status: "failed",
      msg: "Could not save address",
    });
  }
};

export default saveUserAddress;
