import { sequelize } from "../DB/dBConnection.js";
import { Sequelize, DataTypes } from "sequelize";

const Like = sequelize.define("Like", {
    id : {
        type : DataTypes.UUID,
        defaultValue : Sequelize.UUIDV4,
        primaryKey : true
    },
    postId : {
        type : DataTypes.UUID,
        allowNull : false,
        references : {
            model : "Posts",
            key : "id"
        },
        onDelete : "CASCADE"
    },
    userId : {
        type : DataTypes.UUID,
        allowNull : false,
        references : {
            model : "Users",
            key : "id"
        },
        onDelete : "CASCADE"
    }
}, { 
    timestamps : true,
    indexes: [
        {
          unique: true,
          fields: ["postId", "userId"],
        },
      ],
 });

export { Like };