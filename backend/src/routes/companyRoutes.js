import express from "express";
import {
  fetchCompanyData,
  loginCompany,
  postJob,
  registerCompany,
  verifyCompanyOtp,
  forgotCompanyPassword,
  resetCompanyPassword,
  getCompanyPostedAllJobs,
  changeJobVisibility,
  getCompanyJobApplicants,
  changeStatus,
} from "../controllers/companyController.js";
import upload from "../utils/upload.js";
import companyAuthMiddleware from "../middlewares/companyAuthMiddleware.js";

const router = express.Router();

router.post("/register-company", upload.single("image"), registerCompany);
router.post("/verify-otp", verifyCompanyOtp);
router.post("/login-company", loginCompany);
router.post("/forgot-password", forgotCompanyPassword);
router.post("/reset-password", resetCompanyPassword);

router.get("/company-data", companyAuthMiddleware, fetchCompanyData);
router.post("/post-job", companyAuthMiddleware, postJob);
router.get(
  "/company/posted-jobs",
  companyAuthMiddleware,
  getCompanyPostedAllJobs
);
router.post("/change-visiblity", companyAuthMiddleware, changeJobVisibility);
router.post(
  "/view-applications",
  companyAuthMiddleware,
  getCompanyJobApplicants
);
router.post("/change-status", companyAuthMiddleware, changeStatus);

export default router;
