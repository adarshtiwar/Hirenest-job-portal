import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendOtpEmail = async (to, otp, options = {}) => {
  const {
    subject = "Verify Your Email - Hirenest",
    title = "Email Verification",
    description = "Your OTP is:",
  } = options;

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject,
    html: ` 
      <h2>${title}</h2>
      <p>${description}</p>
      <h1>${otp}</h1>
      <p>This OTP will expire in 10 minutes.</p>
      <p>If you did not request this, please ignore this email.</p>
    `,
  });
};

export default sendOtpEmail;
