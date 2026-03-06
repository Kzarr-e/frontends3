"use client";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import styles from "./auth.module.css";
import Link from "next/link";

export default function ResetPassword() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  const submit = async (e) => {
    e.preventDefault();

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/password/reset-password?token=${token}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      }
    );

    const data = await res.json();
    setMsg(data.message);
  };

  return (
    <div className={styles.authWrapper}>
      <div className={styles.authCard}>
        <h1 className={styles.authTitle}>Reset Password</h1>
        <p className={styles.authSub}>
          Enter your new password below
        </p>

        <form onSubmit={submit}>
          <input
            type="password"
            required
            placeholder="Enter new password"
            className={styles.authField}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button className={styles.authBtn}>
            Update Password
          </button>
        </form>

        {msg && (
          <p className={`${styles.authMessage} ${styles.authSuccess}`}>
            {msg}
          </p>
        )}

        <div className={styles.authLinks}>
          <Link href="/login">Back to Login</Link>
        </div>
      </div>
    </div>
  );
}
