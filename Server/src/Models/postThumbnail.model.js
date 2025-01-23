import { sequelize } from "../DB/dBConnection.js";
import { Sequelize, DataTypes } from "sequelize";

const PostThumbnail = sequelize.define(
  "PostThumbnail",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: Sequelize.UUIDV4, // Ensures UUID is generated
      primaryKey: true,
    },
    fileName: {
      type: DataTypes.STRING,
      allowNuLL: false,
      validate: {
        notEmpty: true,
      },  
    },
    fileType: {
      type: DataTypes.STRING,
      allowNuLL: false,
      validate: {
        notEmpty: true,
      },
    },
    s3Key: {
      type: DataTypes.STRING,
      allowNuLL: false,
      validate: {
        notEmpty: true,
      },
    },
    postId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Posts',
        key: 'id',
      },
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

export { PostThumbnail };
