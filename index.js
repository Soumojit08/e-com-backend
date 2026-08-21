import express from "express";
import dotenv from "dotenv";
import figlet from "figlet";
import { clerkMiddleware } from "@clerk/express";
import cors from "cors";
import dataRoutes from "./src/routes/data.route.js";
import authRoutes from "./src/routes/auth.routes.js";
import webHookRoutes from "./src/routes/webhooks.routes.js";

const app = express();
dotenv.config();

//Middlewares
app.use(cors());
app.use(clerkMiddleware());
app.use("/api/webhooks", webHookRoutes);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Routes
app.use("/api", dataRoutes);
app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 4000;

//Running the server
app.listen(PORT, async () => {
  const text = await figlet.text("Server is running at : " + PORT);
  console.log(text);
});
