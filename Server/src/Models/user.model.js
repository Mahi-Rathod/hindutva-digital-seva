import { sequelize } from "../DB/dBConnection.js";
import { Sequelize, DataTypes } from "sequelize";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: Sequelize.UUIDV4, // Ensures UUID is generated
      primaryKey: true,
    },
    userName: {
      type: DataTypes.STRING,
      allowNull: false,
      set(value) {
        this.setDataValue("userName", value.toLowerCase().trim()); // Make it lowercase and trim it
      },
      validate: {
        notEmpty: true, // Prevent empty strings
      },
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true, // Prevent empty strings
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      set(value) {
        this.setDataValue("email", value.toLowerCase().trim()); // Make it lowercase and trim it
      },
      validate: {
        isEmail: true, // Ensure valid email format
        notEmpty: true, // Prevent empty strings
      },
    },
    mobile: {
      type: DataTypes.STRING,
      validate: {
        isNumeric: true, // Ensure mobile contains only numbers
        len: [10, 13], // Length between 10 and 13 digits
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true, // Prevent empty strings
      },
    },
    emailVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    mobileVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    emailOTP: {
      type: DataTypes.STRING,
      validate: {
        len: [0, 6],
      },
    },
    otpExpires: {
      type: DataTypes.DATE,
    },
    mobileOTP: {
      type: DataTypes.STRING,
      validate: {
        len: [0, 6],
      },
    },
    role: {
      type: DataTypes.ENUM("reader", "author", "admin"),
      allowNull: false,
      defaultValue: "reader",
    },
    permissions: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    googleId: {
      type: DataTypes.STRING,
    },
    refreshToken: {
      type: DataTypes.STRING,
    },
  },
  {
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['userName']
      },
      {
        unique: true,
        fields: ['email']
      },
      {
        unique: true,
        fields: ['mobile']
      },
    ],
  }
);

// Lifecycle Hook: Hash password before saving
User.beforeCreate(async (user) => {
  if (user.password) {
    user.password = await bcrypt.hash(user.password, 10);
  }
});

User.beforeUpdate(async (user) => {
  if (user.password && user.changed("password")) {
    user.password = await bcrypt.hash(user.password, 10);
  }
});

// Instance Method: Compare Password
User.prototype.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// Instance Method: Generate Access Token
User.prototype.generateAccessToken = function () {
  return jwt.sign(
    {
      id: this.id, // Sequelize uses `id` as the default primary key
      email: this.email,
      mobile: this.mobile,
      userName: this.userName,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

// Instance Method: Generate Refresh Token
User.prototype.generateRefreshToken = function () {
  return jwt.sign(
    {
      id: this.id, // Sequelize uses `id` as the default primary key
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

export { User };
