import express from "express";
import cookieParser from "cookie-parser";
import session from "express-session";
import passport from "./passportConfig.js";
import dotenv from "dotenv";
import cors from "cors";
import { initializeAssociations } from "./DB/initAssociations.js";

initializeAssociations();

dotenv.config();
const app = express();



const allowedOrigins = process.env.CORS_ORIGIN;

app.use(
  cors({
    origin: function (origin, callback) {
      // 2. Check if NO origin is allowed (for testing, remove in production!)
      if (!origin && allowedOrigins.length === 0) {
        return callback(null, true); // Allow all if no origin is set AND no allowed origins
      }

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    exposedHeaders: ["Content-Length", "Authorization", "Set-Cookie"],
  })
);

app.use(cookieParser());

app.use(express.json());


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
