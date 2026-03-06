"use client";
import { useState } from "react";
import styles from "./auth.module.css";

export default function ForgotPasswordOtp() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ STEP 1: REQUEST OTP VIA EMAIL (REAL)
  const requestOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/email-otp-password/forgot-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );

      const data = await res.json();
      setMsg(data.message || "OTP sent to your email");
      setStep(2);
    } catch (err) {
      setMsg("Failed to send OTP. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ STEP 2: VERIFY EMAIL OTP
  const verifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/email-otp-password/verify-otp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, otp }),
        }
      );

      const data = await res.json();

      if (data.success) {
        setMsg("OTP verified ✅");
        setStep(3);
      } else {
        setMsg(data.message || "Invalid OTP");
      }
    } catch (err) {
      setMsg("OTP verification failed.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ STEP 3: RESET PASSWORD WITH EMAIL OTP
  const resetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/email-otp-password/reset-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, otp, newPassword }),
        }
      );

      const data = await res.json();
      setMsg(data.message || "Password updated successfully");
    } catch (err) {
      setMsg("Password reset failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authWrapper}>
      <div className={styles.authCard}>
        <h1 className={styles.authTitle}>Reset Password</h1>

        {/* ✅ STEP 1 */}
        {step === 1 && (
          <form onSubmit={requestOtp}>
            <input
              type="email"
              className={styles.authField}
              placeholder="Enter your email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button className={styles.authBtn} disabled={loading}>
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </form>
        )}

        {/* ✅ STEP 2 */}
        {step === 2 && (
          <form onSubmit={verifyOtp}>
            <input
              type="text"
              className={styles.authField}
              placeholder="Enter OTP"
              required
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
            <button className={styles.authBtn} disabled={loading}>
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
          </form>
        )}

        {/* ✅ STEP 3 */}
        {step === 3 && (
          <form onSubmit={resetPassword}>
            <input
              type="password"
              className={styles.authField}
              placeholder="New Password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <button className={styles.authBtn} disabled={loading}>
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>
        )}

        {msg && <p className={styles.authMessage}>{msg}</p>}
      </div>
    </div>
  );
}
