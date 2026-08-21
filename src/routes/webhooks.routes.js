import express from "express";
import { verifyWebhook } from "@clerk/express/webhooks";
import prisma from "../lib/prisma.js";

const router = express.Router();

router.post(
  "/clerk",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    try {
      const event = await verifyWebhook(req);

      const { id, first_name, last_name, email_addresses, phone_numbers } =
        event.data;

      console.log(email_addresses);

      const primaryEmail = email_addresses.find(
        (email) => email.id === event.data.primary_email_address_id,
      );

      const email = primaryEmail?.email_addresses;

      const primaryPhone = phone_numbers.find(
        (phone) => phone.id === event.data.primary_phone_number_id,
      );

      const phone = primaryPhone?.phone_number;

      const name = [first_name, last_name].filter(Boolean).join(" ");

      await prisma.user.upsert({
        where: {
          clerkId: id,
        },
        create: {
          clerkId: id,
          email,
          name: name || null,
          phone_no: phone || null,
        },
        update: {
          email,
          name: name || null,
          phone_no: phone || null,
        },
      });

      return res.status(200).json({
        success: true,
      });
    } catch (error) {
      console.error("Error verifying Clerk webhook:", error);

      return res.status(400).json({
        success: false,
      });
    }
  },
);

export default router;
