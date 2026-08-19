import express from "express";
import dotenv from "dotenv";
import figlet from "figlet";
import {
  clerkClient,
  clerkMiddleware,
  getAuth,
  requireAuth,
} from "@clerk/express";
import cors from "cors";
import dataRoutes from "./src/routes/data.route.js";

const app = express();
dotenv.config();

//Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(clerkMiddleware());

//Routes
app.use("/api", dataRoutes);

const PORT = process.env.PORT || 4000;

//Running the server
app.listen(PORT, async () => {
  const text = await figlet.text("Server is running at : " + PORT);
  console.log(text);
});
