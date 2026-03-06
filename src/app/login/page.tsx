"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import "./login.css";
import Loginimg from "../Assest/Login.png";

interface LoginForm {
  emailOrPhone: string;
  password: string;
}

const LoginPage = () => {
  const router = useRouter();

  const [formData, setFormData] = useState<LoginForm>({
    emailOrPhone: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /* ================= INPUT CHANGE ================= */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  /* ================= LOGIN SUBMIT ================= */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.emailOrPhone || !formData.password) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: formData.emailOrPhone,
          password: formData.password,
        }),
      });

      const data = await res.json();

      /* 🔥 EMAIL NOT VERIFIED FLOW */
      if (data.code === "EMAIL_NOT_VERIFIED") {
        localStorage.setItem("verify_email", data.email);
        router.replace("/verify-email");
        return;
      }

      /* ❌ NORMAL ERROR */
      if (!res.ok) {
        setError(data.message || "Login failed.");
        return;
      }

      /* ✅ SUCCESS LOGIN */
      if (data.token) {
        localStorage.setItem("kzarre_token", data.token);
      }

      localStorage.setItem("kzarre_user", JSON.stringify(data.user));
      localStorage.setItem("kzarre_user_id", data.user.id);

      window.dispatchEvent(new Event("auth-change"));

      setSuccess("Login successful! Redirecting...");
      router.replace("/home");
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */
  return (
    <div className="login-container">
      <div className="login-left">
        <Image
          src={Loginimg}
          alt="Login Banner"
          className="login-image"
          priority
        />
      </div>

      <div className="login-right">
        <div className="login-box">
          <h2>
            Log in to <span>KZARRĒ</span>
          </h2>
          <p>Enter your details below</p>

          <form onSubmit={handleSubmit}>
            {/* EMAIL */}
            <div className="input-group">
              <input
                type="text"
                name="emailOrPhone"
                placeholder="Email"
                value={formData.emailOrPhone}
                onChange={handleChange}
              />
            </div>

            {/* PASSWORD */}
            <div className="input-group password-group">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="password-toggle"
              >
                {showPassword ? "Hide" : "Show"}
              </span>
            </div>

            {/* LINKS */}
            <div className="form-links">
              <a href="/register">
                New here? <strong>Create an account</strong>
              </a>
              <a href="/forgot-password">Forgot Password?</a>
            </div>

            {/* MESSAGES */}
            {error && <p className="error-text">{error}</p>}
            {success && <p className="success-text">{success}</p>}

            {/* SUBMIT */}
            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
