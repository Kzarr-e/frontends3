"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import "./verify-email.css";

export default function VerifyEmailPage() {
  const router = useRouter();

  /* ================= STATE ================= */
  const [email, setEmail] = useState<string | null>(null);
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /* ================= TIMER ================= */
  const [seconds, setSeconds] = useState(60);
  const canResend = seconds === 0;

  /* ================= LOAD EMAIL (CLIENT ONLY) ================= */
  useEffect(() => {
    const storedEmail = localStorage.getItem("verify_email");

    if (!storedEmail) {
      router.replace("/login");
      return;
    }

    setEmail(storedEmail);
  }, [router]);

  /* ================= COUNTDOWN ================= */
  useEffect(() => {
    if (seconds === 0) return;
    const timer = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [seconds]);

  /* ================= INPUT REFS ================= */
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  /* ================= OTP INPUT ================= */
  const handleChange = (value: string, index: number) => {
    if (!/^\d?$/.test(value)) return;

    const updated = [...otp];
    updated[index] = value;
    setOtp(updated);

    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  /* ================= VERIFY OTP ================= */
  async function verifyOtp() {
    if (!email) return;

    const code = otp.join("");
    if (code.length !== 6) {
      setError("Enter 6-digit OTP");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, otp: code }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Invalid OTP");
        return;
      }

      /* ✅ AUTO LOGIN */
      localStorage.removeItem("verify_email");
      localStorage.setItem("kzarre_token", data.token);
      localStorage.setItem("kzarre_user", JSON.stringify(data.user));
      localStorage.setItem("kzarre_user_id", data.user.id);

      window.dispatchEvent(new Event("auth-change"));

      setSuccess("Email verified successfully!");
      router.replace("/home");
    } catch {
      setError("Verification failed");
    } finally {
      setLoading(false);
    }
  }

  /* ================= RESEND OTP ================= */
  async function resendOtp() {
    if (!email || !canResend) return;

    setLoading(true);
    setError("");

    try {
      await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      setSeconds(60);
      setSuccess("OTP resent successfully");
    } catch {
      setError("Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  }

  /* ================= LOADING GUARD ================= */
  if (!email) {
    return <div className="verify-container">Loading…</div>;
  }

  /* ================= UI ================= */
  return (
    <div className="verify-container">
      <div className="verify-box">
        <h2>Verify Your Email</h2>
        <p>Enter the 6-digit code sent to</p>
        <strong>{email}</strong>

        <div className="otp-row">
          {otp.map((digit, i) => (
            <input
              key={i}
            ref={(el) => {
  inputsRef.current[i] = el;
}}

              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(e.target.value, i)}
              onKeyDown={(e) => handleKeyDown(e, i)}
            />
          ))}
        </div>

        {error && <p className="error-text">{error}</p>}
        {success && <p className="success-text">{success}</p>}

        <button onClick={verifyOtp} disabled={loading}>
          {loading ? "Verifying..." : "Verify"}
        </button>

        <div className="resend">
          {canResend ? (
            <span onClick={resendOtp}>Resend OTP</span>
          ) : (
            <span>Resend in {seconds}s</span>
          )}
        </div>
      </div>
    </div>
  );
}
