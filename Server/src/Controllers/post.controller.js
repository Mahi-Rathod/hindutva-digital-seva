import { Post } from "../Models/post.model.js";
import { PostThumbnail } from "../Models/postThumbnail.model.js";
import { User } from "../Models/user.model.js";
import { Op } from "sequelize";
import { getObjectUrl } from "../utils/uploadOnS3.js";
import { sequelize } from "../DB/dBConnection.js";
import { Like } from "../Models/like.model.js";
import { Comment } from "../Models/comment.model.js";
import { DB_Name } from "../constants.js";
const addPost = async (req, res) => {
  try {
    const { title, type, thumbnailData, status, content, category } = req.body;

    const { user } = req;

    if ([title, type].some((field) => field?.trim() === "")) {
      throw new Error("title and type are required");
    }

    const post = await Post.create({
      title,
      type,
      status,
      content,
      category,
      authorId: user.id,
    });

    if (!post) {
      throw new Error("Post not created, something happend");
    }

    if (thumbnailData) {
      const { fileName, fileType, S3Key } = thumbnailData;

      const thumbnail = await PostThumbnail.create({
        fileName,
        fileType,
        s3Key: S3Key,
        postId: post.id,
      });

      if (!thumbnail) {
        throw new Error("Error Occurred while adding thumbnail");
      }

      post.thumbnailId = thumbnail.id;
      await post.save();
    }

    res.status(200).json({
      success: true,
      message: "Blog Posted Successfully",
      post: post,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const editPost = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, type, thumbnail, status, content } = req.body;

    const [affectedRows] = await Post.update(
      {
        title,
        type,
        thumbnail,
        status,
        content,
      },
      {
        where: {
          id: id,
        },
      }
    );

    if (affectedRows === 0) {
      throw new Error("Post Not Found");
    }

    const updatedPost = await Post.findByPk(id);
    if (!updatedPost) {
      throw new Error("Post Not Found!. Something went wrong.");
    }

    return res.status(201).json({
      success: true,
      updatedPost: updatedPost,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const fetchTopPostsWithCategory = async (req, res) => {
  try {
    const result = await sequelize.query(
      `WITH RankedPosts AS (
        SELECT 
          p.id,
          p.title,
          p.category,
          p.createdAt,
          pt.s3Key,  -- Assuming pt.s3Key is in postthumbnails table
          u.name AS authorName,
          ROW_NUMBER() OVER (PARTITION BY p.category ORDER BY p.createdAt DESC) AS \`rank\`
        FROM ${DB_Name}.posts p
        LEFT JOIN ${DB_Name}.postthumbnails pt ON pt.postId = p.id  -- Correct join condition
        LEFT JOIN ${DB_Name}.users u ON u.id = p.authorId  -- Correct join condition for users
      )
      SELECT 
        rp.id,
        rp.title,
        rp.category,
        rp.createdAt,
        rp.s3Key,
        rp.authorName
      FROM RankedPosts rp
      WHERE rp.rank <= 10
      ORDER BY rp.category, rp.rank;`,
      { type: sequelize.QueryTypes.SELECT }
    );

    // If no posts are found
    if (!result || result.length === 0) {
      return res.status(404).json({
        message: "No posts found",
      });
    }

    const postRes = await Promise.all(
      result.map(async (post) => {
        if (post.s3Key) {
          const signedUrl = await getObjectUrl(post.s3Key);

          return {
            ...post,
            thumbnail: signedUrl,
          };
        }

        return post;
      })
    );

    // Return the posts with the signed thumbnail URLs
    return res.status(200).json({
      message: "Posts fetched successfully",
      posts: postRes,
    });
  } catch (error) {
    console.error("Error fetching posts:", error);

    return res.status(500).json({
      message: "An error occurred while fetching the posts",
      error: error.message,
    });
  }
};

const getPosts = async (req, res) => {
  try {
    const { page = 1, limit = 10, category } = req.query;
    const offset = (page - 1) * limit;

    const whereCondition = category ? { category: category } : {};

    const posts = await Post.findAll({
      where: whereCondition,
      limit: Number(limit),
      offset: Number(offset),
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: User,
          as: "author",
          attributes: ["name", "email"],
        },
        {
          model: PostThumbnail,
          as: "thumbnail",
          attributes: ["s3Key"],
        },
      ],
    });

    const totalPosts = await Post.count({
      where: whereCondition,
    });

    const postRes = await Promise.all(
      posts.map(async (post) => {
        if (post.thumbnail) {
          const signedUrl = await getObjectUrl(post.thumbnail.s3Key);

          return {
            ...post.toJSON(),
            thumbnail: signedUrl,
          };
        }

        return post.toJSON();
      })
    );

    return res.status(200).json({
      message: "Posts fetched successfully",
      posts: postRes,
      currentPage: page,
      totalPosts,
    });
  } catch (error) {
    return res.status(500).json({
      message: "An error occurred while fetching the posts",
      error: error.message,
    });
  }
};

const viewPost = async (req, res) => {
  try {
    const { id } = req.params;
    let post = await Post.findByPk(id, {
      include: [
        {
          model: User,
          as: "author",
          attributes: ["id", "name", "email"],
        },
        {
          model: PostThumbnail,
          as: "thumbnail",
          attributes: ["id", "s3Key"],
        },
        { model: Like, as: "likes" },
        { model: Comment, as: "comments" }
      ],
    });

    if (post.thumbnail) {
      const imgUrl = await getObjectUrl(post.thumbnail.s3Key);

      post = { ...post.toJSON(), thumbnail: imgUrl };
    }

    if (!post) {
      throw new Error("Post Not Found");
    }

    return res.status(200).json({
      success: true,
      post: post,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const adminPanelData = async (req, res) => {
  try {
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export { addPost, getPosts, viewPost, editPost, fetchTopPostsWithCategory };
