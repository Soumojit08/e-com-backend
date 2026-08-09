import express, { json } from "express";
import dotenv from "dotenv";
import cors from "cors";
import dataRoutes from "./src/routes/data.route.js";

const app = express();
dotenv.config();

const port = process.env.PORT;

//Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Routes
app.use("/api", dataRoutes);

app.listen(port, (req, res) => {
  console.log(`Server Started at ${port}`);
});
