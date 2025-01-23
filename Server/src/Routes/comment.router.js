import { Router } from 'express';
import { addComment, updateComment, getPostComments, deleteComment } from '../Controllers/comment.controller.js';
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

router.get("/get-post-comments/:postId", getPostComments);
router.post("/add-comment", verifyJWT, addComment);
router.put("/update-post-comments/:commentId", verifyJWT, updateComment);
router.delete("/delete-comment/:commentId", verifyJWT, deleteComment);

export default router;