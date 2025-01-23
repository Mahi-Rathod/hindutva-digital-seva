import { Comment } from "../Models/comment.model.js";
import { User } from "../Models/user.model.js";

// Add a comment
export const addComment = async (req, res) => {
  const { postId, content, parentId } = req.body;
  const userId = req.user.id;

  try {
    const comment = await Comment.create({ postId, userId, content, parentId });
    res.status(201).json({ message: "Comment added successfully.", comment });
  } catch (error) {
    res.status(500).json({ message: "Error adding comment.", error });
  }
};

// Get all comments for a post
export const getPostComments = async (req, res) => {
  const { postId } = req.params;

  try {
    const comments = await Comment.findAll({
      where: { postId },
      include: [
        { model: User, as: "user", attributes: ["id", "name", "userName"] },
        { model: Comment, as: "replies" },
      ],
    });
    res.status(200).json({ comments });
  } catch (error) {
    res.status(500).json({ message: "Error fetching comments.", error });
  }
};

// Update a comment
export const updateComment = async (req, res) => {
  const { commentId } = req.params;
  const { content } = req.body;
  const userId = req.user.id;

  try {
    const comment = await Comment.findOne({ where: { id: commentId, userId } });
    if (!comment) {
      return res.status(404).json({ message: "Comment not found." });
    }

    comment.content = content;
    await comment.save();
    res.status(200).json({ message: "Comment updated successfully.", comment });
  } catch (error) {
    res.status(500).json({ message: "Error updating comment.", error });
  }
};

// Delete a comment
export const deleteComment = async (req, res) => {
  const { commentId } = req.params;
  const userId = req.user.id;

  try {
    const comment = await Comment.findOne({ where: { id: commentId, userId } });
    if (!comment) {
      return res.status(404).json({ message: "Comment not found." });
    }

    await comment.destroy();
    res.status(200).json({ message: "Comment deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Error deleting comment.", error });
  }
};
