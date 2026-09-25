import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

dotenv.config();

const prisma = new PrismaClient();

const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log("Database Connected");
  } catch (error) {
    console.error("Database Connection failed:", error);
  }
};

connectDB();

export default prisma;
