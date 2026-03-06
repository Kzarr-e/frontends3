"use client";

import React from "react";
import {
  User,
  Package,
  Settings,
  ShoppingCart,
  Lock
} from "lucide-react";
import styles from "./Settings.module.css";
import PageLayout from "../components/PageLayout";
import SidebarNav from "../components/SidebarNav"

export default function SettingsPage() {
  /* ============================================================
      LOGOUT FUNCTION
    ============================================================ */
  function handleLogout() {
    // Remove token from localStorage
    localStorage.removeItem("kzarre_token");

    // Remove ALL cookies
    document.cookie.split(";").forEach((c) => {
      document.cookie =
        c.trim().split("=")[0] +
        "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    });

    // Redirect user (you can change to "/home")
    window.location.href = "/login";
  }

  return (
<PageLayout>
    <div className={styles.pageWrap}>
      <div className={styles.container}>
       <SidebarNav active="profile" />
        <main className={styles.content}>
          <h2 className={styles.sectionTitle}>Settings</h2>

          <div className={styles.card}>
            {/* LEFT SIDE */}
            <div className={styles.cardLeft}>
              <Lock size={20} className={styles.icon} />
              <div>
                <h4 className={styles.cardTitle}>Sign out everywhere</h4>
                <p className={styles.cardText}>
                  If you’ve lost a device or have security concerns, log out
                  everywhere to ensure your account security.
                </p>
              </div>
            </div>

            {/* RIGHT SIDE */}
            <div className={styles.cardRight}>
              <button className={styles.signOutBtn} onClick={handleLogout}>
                Sign out
              </button>
              <p className={styles.note}>
                You’ll also be signed out on this device
              </p>
            </div>
          </div>
        </main>

      </div>
    </div>
</PageLayout>
  );
}
