import { sequelize } from "../DB/dBConnection.js";
import { Sequelize, DataTypes } from "sequelize";

const Post = sequelize.define(
  "Post",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: Sequelize.UUIDV4, // Ensures UUID is generated
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    type: {
      type: DataTypes.ENUM("News", "Event", "Announcement", "Article"),
      allowNull: false,
      defaultValue: "News",
    },
    category: {
      type: DataTypes.ENUM(
        "Latest-News",
        "Government-Schemes",
        "Job-Bharati",
        "GR",
        "Education",
        "Information"
      ),
      allowNull: false,
      defaultValue: "Latest-News",
    },
    thumbnailId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "PostThumbnails",
        key: "id",
      },
      unique: true,
      onDelete: "CASCADE",
    },
    status: {
      type: DataTypes.ENUM("Posted", "Drafts"),
      allowNull: false,
      defaultValue: "Posted",
    },
    content: {
      type: DataTypes.TEXT("long"),
      allowNull: true,
    },
    authorId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "Users",
        key: "id",
      },
      onDelete: "CASCADE",
    },
    likeCount: {
      type: DataTypes.VIRTUAL,
      get() {
        return this.getDataValue("likes")
          ? this.getDataValue("likes").length
          : 0;
      },
    },
    commentCount: {
      type: DataTypes.VIRTUAL,
      get() {
        return this.getDataValue("comments")
          ? this.getDataValue("comments").length
          : 0;
      },
    },
  },
  {
    timestamps: true,
  }
);

export { Post };
