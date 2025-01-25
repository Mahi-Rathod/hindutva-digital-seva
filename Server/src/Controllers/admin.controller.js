import { User } from "../Models/user.model.js";
import { Post } from "../Models/post.model.js";
import { sequelize } from "../DB/dBConnection.js";
import { Sequelize } from "sequelize";
import { DB_Name } from "../constants.js";
const getDashboardData = async (req, res) => {
  try {
    const totalUsers = await User.count();

    const totalPosts = await Post.count();

    const totalCategories = await Post.count({
      distinct: true,
      col: "category",
    });

    const totalPendingPosts = await Post.count({
      where: {
        status: "pending",
      },
    });

    // const allPosts = await Post.findAll({
    //     order : [['createdAt', 'DESC']]
    // });

    const allPosts = await sequelize.query(
      `
        SELECT p.id, p.title, p.type, p.category, p.status, p.content, DATE(p.createdAt) AS date, u.name
        FROM ${DB_Name}.Posts AS p
        INNER JOIN ${DB_Name}.Users AS u
        ON p.authorId = u.id
        ORDER BY p.createdAt DESC
        LIMIT 20
      `, {
        type : sequelize.QueryTypes.SELECT
      }
    );


    res.status(201).json({
      totalPosts: totalPosts,
      totalUsers: totalUsers,
      totalCategories: totalCategories,
      totalPendingPosts: totalPendingPosts,
      allPosts: allPosts,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export { getDashboardData };
