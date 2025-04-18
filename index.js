import express from "express";
import cors from "cors";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import userRouter from './routes/user.route.js';
import pinRouter from './routes/pin.route.js';
import commentRouter from './routes/comment.route.js';
import boardRouter from './routes/board.route.js';
import connectDb from "./utils/connectDB.js";
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload";
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();
const app = express();

// ✅ Serve static files like images
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(express.json());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(cookieParser());
app.use(fileUpload());

app.use("/users", userRouter);
app.use("/pins", pinRouter);
app.use("/comments", commentRouter);
app.use("/boards", boardRouter);

app.listen(3000, () => {
  connectDb();
  console.log("Server is running!");
});
