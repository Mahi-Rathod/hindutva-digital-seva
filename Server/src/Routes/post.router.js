import { Router } from "express";
import { verifyJWT, verifyAdmin } from "../Middlewares/auth.middlewares.js";
import { addPost, editPost, getPosts, viewPost, fetchTopPostsWithCategory } from "../Controllers/post.controller.js";
import { addPostThumbnail } from "../Controllers/thumbnail.controller.js";

const router = Router();

router.post("/add-post", verifyJWT, verifyAdmin, addPost);
router.get("/get-posts", getPosts);
router.get("/view-post/:id", viewPost);
router.patch("/edit-post/:id", verifyJWT, verifyAdmin, editPost);
router.get("/top-posts-category", fetchTopPostsWithCategory);

router.post("/add-post-thumbnail", verifyJWT, verifyAdmin, addPostThumbnail);

export default router;