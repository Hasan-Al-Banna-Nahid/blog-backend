import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import router from "./src/routes/blog.routes";
import cors from "cors";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());
mongoose
  .connect(process.env.MONGO_URI as string)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

app.use("/api/blogs", router);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
