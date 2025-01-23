import { User } from "../Models/user.model.js";
import { Post } from "../Models/post.model.js";
import { PostThumbnail } from "../Models/postThumbnail.model.js";
import { Comment } from "../Models/comment.model.js";
import { Like } from "../Models/like.model.js";

const initializeAssociations = () => {
    User.hasMany(Post, { foreignKey: 'authorId', as: 'posts' });
    Post.belongsTo(User, { foreignKey: 'authorId', as: 'author' });
  
    // One-to-one association between Post and PostThumbnail
    Post.hasOne(PostThumbnail, { foreignKey: 'postId', as: 'thumbnail' });
    PostThumbnail.belongsTo(Post, { foreignKey: 'postId', as: 'post' });


    //Likes associations
    User.hasMany(Like, { foreignKey: "userId", as: "likes" });
    Like.belongsTo(User, { foreignKey : "userId", as : "user" }); 

    Post.hasMany(Like, { foreignKey : "postId", as : "likes"});
    Like.belongsTo(Post, { foreignKey : "postId", as : "post"});

    //comments associations

    User.hasMany(Comment, { foreignKey : "userId", as : "comments" });
    Comment.belongsTo(User, { foreignKey : "userId", as : "user" });

    Post.hasMany(Comment, { foreignKey : "postId", as : "comments" });
    Comment.belongsTo(Post, { foreignKey : "postId", as : "post" });

    Comment.hasMany(Comment, { foreignKey : "parentId", as : "replies" });
    Comment.belongsTo(Comment, { foreignKey : "parentId", as : "parent" });
  };
  
  export { initializeAssociations };  
  