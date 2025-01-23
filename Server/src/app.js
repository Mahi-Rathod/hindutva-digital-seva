import express from "express";
import cookieParser from "cookie-parser";
import session from "express-session";
import passport from "./passportConfig.js"
import dotenv from "dotenv";
import cors from 'cors';
import { initializeAssociations } from "./DB/initAssociations.js";

initializeAssociations();

dotenv.config();
const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(cors({
  origin:process.env.CORS_ORIGIN,
  credentials: true,
  exposedHeaders: ['Content-Length', 'Authorization', 'Set-Cookie'],  
}));

app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());



//Import Routers here
import userRouter from "./Routes/user.routers.js";
import emailRouter from "./Routes/otpVerification.router.js";
import postRouter from "./Routes/post.router.js";
import likeRouter from "./Routes/like.router.js";
import commentRouter from "./Routes/comment.router.js";
import adminRouter from "./Routes/admin.router.js";

app.use("/api/", emailRouter);
app.use("/api/user", userRouter);
app.use("/api/posts", postRouter);
app.use("/api/like", likeRouter);
app.use("/api/comment", commentRouter);
app.use("/api/admin", adminRouter);

export default app;
