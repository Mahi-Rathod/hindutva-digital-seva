import { User } from "../Models/user.model.js";
import emailTemplate from "../utils/otpEmailTemplate.js";
import sendEmail from "../utils/sendEmail.js";

// Configurations
const OTP_EXPIRY_TIME = 10 * 60 * 1000; // 10 minutes in milliseconds

// Generate OTP
const generateOTP = async (req, res, respond = true) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiryDate = new Date(Date.now() + OTP_EXPIRY_TIME);

    console.log(expiryDate);

    user.emailOTP = otp;
    user.otpExpires = expiryDate;

    const emailTemplateHTML = emailTemplate(user.name, otp);

    const emailSent = await sendEmail(emailTemplateHTML, email);
    if (!emailSent) {
      throw new Error("Failed to send email. Please check the email address.");
    }

    await user.save();

    if (respond) {
      return res
        .status(200)
        .json({ success: true, message: "OTP sent successfully!" });
    }

    return true;
  } catch (err) {
    if (respond) {
      return res.status(500).json({ success: false, message: err.message });
    }
    return false;
  }
};

// Verify OTP
const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }


    if (
      user.emailOTP !== otp ||
      Date.now() > new Date(user.otpExpires).getTime()
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired OTP." });
    }

    user.emailVerified = true;
    user.emailOTP = null;
    user.otpExpires = null;

    await user.save();

    return res
      .status(200)
      .json({ success: true, message: "Email verified successfully!" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export { generateOTP, verifyOTP };
