import { sequelize } from "../DB/dBConnection.js";
import { Sequelize, DataTypes } from "sequelize";

const Comment = sequelize.define("Comment", 
    {
        id : {
            type : DataTypes.UUID,
            defaultValue : Sequelize.UUIDV4,
            primaryKey : true
        },
        content : {
            type : DataTypes.TEXT,
            allowNull : false
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
        },
        parentId : {
            type : DataTypes.UUID,
            allowNull : true,
            references : {
                model : "Comments",
                key : "id",
            },
            onDelete : "CASCADE"
        }
    },
    { timestamps : true }
);

export { Comment };