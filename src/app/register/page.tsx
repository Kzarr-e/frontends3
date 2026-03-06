"use client";
import React, { useState, useRef, useEffect } from "react";
import "./singup.css";
import RegisterImg from "../Assest/Singup.png";
import Image from "next/image";
import { useRouter } from "next/navigation";

const SingupPage = () => {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const otpRefs = useRef<HTMLInputElement[]>([]);
  const [showOtpStep, setShowOtpStep] = useState(false);
  const [editEmail, setEditEmail] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Password strength state
  const [strengthBars, setStrengthBars] = useState([
    { active: false, color: "" },
    { active: false, color: "" },
    { active: false, color: "" },
    { active: false, color: "" },
  ]);
  const [strengthLabel, setStrengthLabel] = useState("");

  // Resend OTP timer state
  const [resendTimer, setResendTimer] = useState(0);
  const [isResendDisabled, setIsResendDisabled] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendTimer > 0) {
      timer = setInterval(() => setResendTimer((t) => t - 1), 1000);
    } else if (resendTimer === 0) {
      setIsResendDisabled(false);
    }
    return () => clearInterval(timer);
  }, [resendTimer]);

  // Format timer mm:ss
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Password strength logic
  const handlePasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length > 5) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    const newBars = strengthBars.map((_, i) => ({
      active: i < strength,
      color:
        strength <= 1
          ? "weak"
          : strength === 2
          ? "medium"
          : strength === 3
          ? "good"
          : "strong",
    }));

    setStrengthBars(newBars);
    const labels = ["Weak", "Medium", "Good", "Strong"];
    setStrengthLabel(strength ? labels[strength - 1] : "");
  };

  // OTP input handling
  const handleOtpChange = (value: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleBackspace = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  // STEP 1 — Send OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/auth/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            password: formData.password,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to send OTP");
      } else {
        setSuccess("OTP sent to your email. Please check your inbox.");
        setShowOtpStep(true);
        setEditEmail(false);
        setIsResendDisabled(true);
        setResendTimer(120); // 2 minutes = 120 seconds
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // STEP 2 — Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const otpCode = otp.join("");

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/auth/verify-otp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: formData.email,
            otp: otpCode,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Invalid OTP");
      } else {
        setSuccess("Email verified successfully! Redirecting to login...");
        setTimeout(() => router.push("/login"), 2000);
      }
    } catch (err) {
      setError("Failed to verify OTP. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-left">
        <div className="register-box">
          <h2>
            Register to <span>KZARRĒ</span>
          </h2>
          <p>Enter your details below</p>

          {!showOtpStep ? (
            <form onSubmit={handleSendOtp}>
              <div className="input-group">
                <input
                  type="text"
                  name="name"
                  placeholder="Name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="input-group">
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Password Input + Strength Meter */}
              <div className="input-group password-wrapper">
                <div className="password-field">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={(e) => {
                      handleChange(e);
                      handlePasswordStrength(e.target.value);
                    }}
                    required
                  />
                  <button
                    type="button"
                    className="toggle-password-btn"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>

                <div className="password-strength">
                  {strengthBars.map((bar, index) => (
                    <div
                      key={index}
                      className={`strength-bar ${
                        bar.active ? bar.color : "inactive"
                      }`}
                    ></div>
                  ))}
                </div>

                {strengthLabel && (
                  <p className={`strength-text ${strengthLabel.toLowerCase()}`}>
                    {strengthLabel} password
                  </p>
                )}
              </div>

              <div className="input-group">
                <input
                   type={showPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  
                />
                <button
                    type="button"
                    className="toggle-password-btn"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
              </div>

              {error && <p className="error-text">{error}</p>}
              {success && <p className="success-text">{success}</p>}

              <button type="submit" className="register-btn" disabled={loading}>
                {loading ? "Sending OTP..." : "Send OTP"}
              </button>

              <button
                type="button"
                className="login-btn"
                onClick={() => router.push("/login")}
              >
                Already have an account? Login
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp}>
              {!editEmail ? (
                <p>
                  OTP sent to <strong>{formData.email}</strong>{" "}
                  <button
                    type="button"
                    onClick={() => setEditEmail(true)}
                    className="edit-email-btn"
                  >
                    Edit
                  </button>
                </p>
              ) : (
                <div className="input-group">
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter correct email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              )}

              <div className="otp-box">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => {
                      otpRefs.current[index] = el as HTMLInputElement;
                    }}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(e.target.value, index)}
                    onKeyDown={(e) => handleBackspace(e, index)}
                    className="otp-input"
                  />
                ))}
              </div>

              {error && <p className="error-text">{error}</p>}
              {success && <p className="success-text">{success}</p>}

              <button type="submit" className="register-btn" disabled={loading}>
                {loading ? "Verifying..." : "Verify OTP"}
              </button>

              <button
                type="button"
                className="register-btn resend-btn"
                onClick={handleSendOtp}
                disabled={isResendDisabled || loading}
                style={{ marginTop: "10px" }}
              >
                {isResendDisabled
                  ? `Resend OTP in ${formatTime(resendTimer)}`
                  : "Resend OTP"}
              </button>

              <button
                type="button"
                className="register-btn login-btn"
                onClick={() => router.push("/login")}
              >
                Go to Login
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="register-right">
        <Image src={RegisterImg} alt="Register" className="register-image" />
      </div>
    </div>
  );
};

export default SingupPage;
