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

      if (event.type === "user.deleted") {
        const { id } = event.data;

        await prisma.user.delete({
          where: {
            clerkId: id,
          },
        });

        return res.status(200).json({
          success: true,
          msg: "User deleted successfully",
        });
      }

      if (event.type === "user.created" || event.type === "user.updated") {
        const {
          id,
          first_name,
          last_name,
          email_addresses,
          phone_numbers,
          primary_email_address_id,
          primary_phone_number_id,
        } = event.data;

        const primaryEmail = email_addresses.find(
          (email) => email.id === primary_email_address_id,
        );

        const email = primaryEmail?.email_address ?? null;

        const primaryPhone = phone_numbers.find(
          (phone) => phone.id === primary_phone_number_id,
        );

        const phone = primaryPhone?.phone_number ?? null;

        const name = [first_name, last_name].filter(Boolean).join(" ");

        //create user
        if (event.type === "user.created") {
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
            msg: "New user created",
          });
        } else {
          //update user data
          await prisma.user.update({
            where: {
              clerkId: id,
            },
            data: {
              email,
              name: name || null,
              phone_no: phone || null,
            },
          });

          return res.status(200).json({
            success: true,
            msg: "user data updated",
          });
        }
      }
      return res.status(503).json({
        success: false,
        msg: "Unmatched event ",
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
