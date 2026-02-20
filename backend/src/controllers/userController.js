import bcrypt from "bcrypt";
import { v2 as cloudinary } from "cloudinary";
import sendOtpEmail from "../utils/sendEmail.js";

import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import JobApplication from "../models/JobApplication.js";
import Job from "../models/Job.js";
import {
  calculateAtsFromText,
  extractTextFromLocalResume,
} from "../utils/resumeAnalyzer.js";

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();
const OTP_EXPIRY_MS = 10 * 60 * 1000;

export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const imageFile = req.file;

    if (!name) return res.json({ success: false, message: "Enter your name" });
    if (!email) return res.json({ success: false, message: "Enter your email" });
    if (!password) return res.json({ success: false, message: "Enter your password" });
    if (!imageFile) return res.json({ success: false, message: "Upload your image" });

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      if (existingUser.isVerified) {
        return res.json({ success: false, message: "User already exists" });
      }

      existingUser.otp = generateOtp();
      existingUser.otpExpiry = Date.now() + OTP_EXPIRY_MS;
      await existingUser.save();

      await sendOtpEmail(existingUser.email, existingUser.otp);

      return res.json({
        success: true,
        message: "OTP resent to your email. Please verify.",
        email: existingUser.email,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const imageUploadUrl = await cloudinary.uploader.upload(imageFile.path);
    const otp = generateOtp();

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      image: imageUploadUrl.secure_url,
      otp,
      otpExpiry: Date.now() + OTP_EXPIRY_MS,
      isVerified: false,
    });

    await sendOtpEmail(email, otp);

    return res.json({
      success: true,
      message: "OTP sent to your email. Please verify.",
      email: user.email,
    });
  } catch (error) {
    console.log(error);
    return res.json({
      success: false,
      message: "Registration failed",
    });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "User already verified",
      });
    }

    if (user.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    if (!user.otpExpiry || user.otpExpiry < Date.now()) {
      return res.status(400).json({
        success: false,
        message: "OTP expired",
      });
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    const token = await generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: "Email verified successfully",
      token,
      userData: user,
    });
  } catch (error) {
    console.error("OTP Verification Error:", error);
    return res.status(500).json({
      success: false,
      message: "Verification failed",
    });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });
    }

    if (!password) {
      return res
        .status(400)
        .json({ success: false, message: "Password is required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email with OTP before login",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid password" });
    }

    const token = await generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      userData: user,
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ success: false, message: "Login failed" });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.otp = generateOtp();
    user.otpExpiry = Date.now() + OTP_EXPIRY_MS;
    await user.save();

    await sendOtpEmail(email, user.otp, {
      subject: "Reset Password OTP - Hirenest",
      title: "Reset Password",
      description: "Use this OTP to reset your password:",
    });

    return res.status(200).json({
      success: true,
      message: "Password reset OTP sent to your email",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return res.status(500).json({ success: false, message: "Failed to send reset OTP" });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword, password } = req.body;
    const resolvedPassword = newPassword || password;

    if (!email || !otp || !resolvedPassword) {
      return res.status(400).json({
        success: false,
        message: "Email, OTP and new password are required",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    if (!user.otpExpiry || user.otpExpiry < Date.now()) {
      return res.status(400).json({ success: false, message: "OTP expired" });
    }

    user.password = await bcrypt.hash(resolvedPassword, 10);
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successful",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return res.status(500).json({ success: false, message: "Failed to reset password" });
  }
};

export const fetchUserData = async (req, res) => {
  try {
    const userData = req.userData;

    return res.status(200).json({
      success: true,
      message: "user data fetched successfully",
      userData,
    });
  } catch (error) {
    return res.status(200).json({
      success: false,
      message: "user data fetched failed",
      userData,
    });
  }
};

export const applyJob = async (req, res) => {
  try {
    const { jobId } = req.body;
    const userId = req.userData._id;

    if (!userId || !jobId) {
      return res.status(400).json({
        success: false,
        message: "User ID and Job ID are required",
      });
    }

    const isAlreadyApplied = await JobApplication.findOne({ userId, jobId });

    if (isAlreadyApplied) {
      return res.status(409).json({
        success: false,
        message: "You have already applied for this job",
      });
    }

    const jobData = await Job.findById(jobId);

    if (!jobData) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    const jobApplication = new JobApplication({
      jobId,
      userId,
      companyId: jobData.companyId,
      date: new Date(),
    });

    await jobApplication.save();

    return res.status(201).json({
      success: true,
      message: "Job applied successfully",
      jobApplication,
    });
  } catch (error) {
    console.error("Job application error:", error);

    return res.status(500).json({
      success: false,
      message: "Job application failed",
    });
  }
};

export const getUserAppliedJobs = async (req, res) => {
  try {
    const userId = req.userData._id;

    const application = await JobApplication.find({ userId })
      .populate("companyId", "name email image")
      .populate("jobId", "title location date status");

    return res.status(200).json({
      success: true,
      message: "Jobs application fetched successfully",
      jobApplications: application,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch jobs application",
    });
  }
};

export const uploadResume = async (req, res) => {
  try {
    const userId = req.userData._id;
    const resumeFile = req.file;

    if (!resumeFile) {
      return res.status(400).json({
        success: false,
        message: "Resume file is required",
      });
    }

    const userData = await User.findById(userId);

    if (!userData) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const resumeText = await extractTextFromLocalResume(
      resumeFile.path,
      resumeFile.mimetype,
      resumeFile.originalname
    );
    const ats = calculateAtsFromText(resumeText);

    const uploadedResumeUrl = await cloudinary.uploader.upload(resumeFile.path, {
      resource_type: "raw",
      public_id: `resumes/${userId}_${Date.now()}`,
    });

    userData.resume = uploadedResumeUrl.secure_url;
    userData.skills = ats.skills;
    userData.atsScore = ats.score;
    userData.atsImprovements = ats.improvements;

    await userData.save();

    return res.status(200).json({
      success: true,
      message: "Resume uploaded and ATS analysis completed",
      resumeUrl: userData.resume,
      atsScore: userData.atsScore,
      atsImprovements: userData.atsImprovements,
      skills: userData.skills,
    });
  } catch (error) {
    console.error("Upload error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to upload resume",
    });
  }
};
