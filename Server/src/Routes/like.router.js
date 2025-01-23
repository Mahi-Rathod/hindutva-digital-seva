import { Router } from "express";
import { verifyJWT } from "../Middlewares/auth.middlewares.js";
import { likeUnlikePost, getPostLikes } from "../Controllers/like.controller.js";

const router = Router();

router.post("/posts/:postId/like-unlike", verifyJWT, likeUnlikePost);
router.get("/posts/:postId", getPostLikes);

export default router;