import { User } from "../Models/user.model.js";
import { generateOTP } from "./otp.controller.js";
import validator from "validator";
import { Op } from "sequelize";

// Generate Access and Refresh Token
const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findByPk(userId);

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (err) {
    throw new Error("Something went wrong while generating the tokens!");
  }
};

// Controller for Registering the Users
const signup = async (req, res) => {
  try {
    const { userName, name, email, mobile, password, role } = req.body;

    if (
      [userName, name, email, mobile, password].some(
        (field) => field?.trim() === ""
      )
    ) {
      throw new Error("All Fields are required");
    }

    const existedUser = await User.findOne({
      where: {
        [Op.or]: [{ email }, { userName }, { mobile }],
      },
    });

    if (existedUser) {
      throw new Error("User Present with provided email or mobile!");
    }

    let permissions;

    if (role === "admin") {
      permissions = ["create", "read", "update", "delete"];
    } else {
      permissions = ["read"];
    }

    const user = await User.create({
      userName,
      name,
      email,
      mobile,
      password,
      role  : role || "reader",
      permissions: permissions,
    });

    if (!user) {
      throw new Error("User not Created, something went wrong.");
    }

    const otpResponse = await generateOTP({ body: { email } }, res, false);
    if (otpResponse) {
      res.status(200).json({
        success: true,
        userId: user.id,
        name: user.userName,
        email: user.email,
        mobile: user.mobile,
        message: "OTP sent on email",
      });
    } else {
      throw new Error("Failed in Sending OTP's.");
    }
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

//Controller for login using password
const signInUsingPassword = async (req, res) => {
  try {
    const { userIdentifier, password } = req.body;

    if ([userIdentifier, password].some((field) => field?.trim() === "")) {
      return res.status(400).json({
        success: false,
        message: "All fields are required!",
      });
    }

    let findString;
    if (validator.isEmail(userIdentifier)) {
      findString = "email";
    } else if (
      validator.isMobilePhone(userIdentifier, "any", { strictMode: true })
    ) {
      findString = "mobile";
    } else {
      findString = "userName";
    }

    const user = await User.findOne({
      where: {
        [findString]: userIdentifier,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found!",
      });
    }

    if (!user.emailVerified) {
      return res.status(403).json({
        success: false,
        message: "Email not verified. Please verify your email first.",
      });
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Incorrect password. Please try again.",
      });
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
      user?.id
    );

    const loggedUser = await User.findByPk(user?.id, {
      attributes: { exclude: ["password", "refreshToken"] },
    });

    const secure = true;

    const options = {
      httpOnly: true,
      secure: secure,
      sameSite: "none",
      maxAge: 3600000, // 1 hour
    };

    return res.status(200).cookie("accessToken", accessToken, options).json({
      success: true,
      user: loggedUser,
      accessToken: accessToken,
      message: "User logged in successfully.",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "An internal server error occurred. Please try again later.",
    });
  }
};

//Controller for Login using OTP
const signInUsingOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      throw new Error("User not found!");
    }

    if (user.emailOTP !== otp) {
      throw new Error("OTP not matched or Expired OTP!");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
      user?.id
    );

    const loggedUser = await User.findByPk(user?.id).select(
      "-password -refreshToken"
    );

    const secure = true;

    const options = {
      httpsOnly: true,
      secure: secure,
      sameSite: "none",
      maxAge: 3600000,
    };

    return res.status(200).cookie("accessToken", accessToken, options).json({
      success: true,
      user: loggedUser,
      accessToken: accessToken,
      message: "User Logged in Successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

//Controller for log out
const signOut = async (req, res) => {
  try {
    await User.update(
      {
        refreshToken: undefined,
      },
      {
        where: {
          id: req.user.id,
        },
      }
    );

    const options = {
      httpsOnly: true,
      sameSite: "none",
      secure: true,
    };

    return res.status(200).clearCookie("accessToken", options).json({
      success: true,
      message: "User Logged Out Successfully!",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const getUser = (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const googleLogin = async (req, res) => {
  const token = jwt.sign();
};

export { signup, signInUsingPassword, signInUsingOTP, signOut, googleLogin, getUser };
