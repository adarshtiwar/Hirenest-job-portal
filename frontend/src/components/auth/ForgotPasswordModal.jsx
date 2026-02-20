import axios from "axios";
import { LoaderCircle, Lock, Mail } from "lucide-react";
import React, { useState } from "react";
import { toast } from "react-hot-toast";

const parseApiError = (error) =>
  error?.response?.data?.message || error?.message || "Request failed";

const callWithFallback = async (backendUrl, endpoints, payload) => {
  let lastError = null;

  for (const endpoint of endpoints) {
    try {
      const { data } = await axios.post(`${backendUrl}${endpoint}`, payload);
      if (data?.success === false) {
        throw new Error(data?.message || "Request failed");
      }
      return { ok: true, data };
    } catch (error) {
      lastError = error;
      const status = error?.response?.status;
      if (status === 404 || status === 405) continue;
      return { ok: false, error: parseApiError(error) };
    }
  }

  return {
    ok: false,
    error: parseApiError(lastError) || "No matching backend endpoint found",
  };
};

const ForgotPasswordModal = ({
  open,
  onClose,
  backendUrl,
  title,
  requestEndpoints,
  resetEndpoints,
}) => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await callWithFallback(backendUrl, requestEndpoints, {
      email,
    });
    setLoading(false);

    if (!result.ok) {
      toast.error(result.error);
      return;
    }

    toast.success(result.data?.message || "OTP sent to your email");
    setStep(2);
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await callWithFallback(backendUrl, resetEndpoints, {
      email,
      otp,
      newPassword,
      password: newPassword,
    });
    setLoading(false);

    if (!result.ok) {
      toast.error(result.error);
      return;
    }

    toast.success(result.data?.message || "Password reset successful");
    setStep(1);
    setEmail("");
    setOtp("");
    setNewPassword("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <h2 className="text-xl font-semibold text-gray-800 mb-1">{title}</h2>
        <p className="text-sm text-gray-500 mb-4">
          {step === 1
            ? "Enter your email to receive OTP"
            : "Enter OTP and set a new password"}
        </p>

        {step === 1 ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div className="border border-gray-300 rounded flex items-center p-2.5">
              <Mail className="h-5 w-5 text-gray-400 mr-2" />
              <input
                type="email"
                placeholder="Email address"
                className="w-full outline-none text-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="w-1/2 border border-gray-300 rounded py-2 text-sm cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-1/2 bg-blue-600 text-white rounded py-2 text-sm flex items-center justify-center cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <LoaderCircle className="animate-spin h-4 w-4" />
                ) : (
                  "Send OTP"
                )}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleReset} className="space-y-4">
            <input
              type="text"
              placeholder="Enter OTP"
              className="w-full border border-gray-300 rounded p-2.5 text-sm outline-none"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />
            <div className="border border-gray-300 rounded flex items-center p-2.5">
              <Lock className="h-5 w-5 text-gray-400 mr-2" />
              <input
                type="password"
                placeholder="New password"
                className="w-full outline-none text-sm"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-1/2 border border-gray-300 rounded py-2 text-sm cursor-pointer"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-1/2 bg-blue-600 text-white rounded py-2 text-sm flex items-center justify-center cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <LoaderCircle className="animate-spin h-4 w-4" />
                ) : (
                  "Reset Password"
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordModal;
