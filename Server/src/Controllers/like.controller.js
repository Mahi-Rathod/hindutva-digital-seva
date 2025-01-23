import { Like } from "../Models/like.model.js";
import { User } from "../Models/user.model.js";

const likeUnlikePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { user } = req;

    const existingLike = await Like.findOne({
      where: { postId, userId: user.id },
    });

    if (existingLike) {
      await existingLike.destroy();
      return res.status(200).json({ message: "Like removed successfully." });
    }
    else {
      const newLike = await Like.create({ postId, userId: user.id });
      return res
        .status(201)
        .json({ message: "Post liked successfully.", like: newLike });
    }
  } 
  catch (error) {
    res.status(500).json({ message: "Error handling like/unlike route.", error });
  }
};

const getPostLikes = async (req, res) => {
  try {
    const { postId } = req.params;

    const likes = await Like.findAll({
      where: { postId },
      include: [{ model: User, as : "user", attributes: ["id", "name", "userName"] }],
    });
    res.status(200).json({ likes });
  } catch (err) {
    res.status(500).json({ message: "Error fetching likes.", err });
  }
};

export {
    likeUnlikePost, getPostLikes
}