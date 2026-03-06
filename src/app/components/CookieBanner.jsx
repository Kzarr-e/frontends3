"use client";

import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import "./cookie-banner.css";

export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = Cookies.get("cookie_consent");

    // Show banner only if no previous choice
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const acceptCookies = () => {
    Cookies.set("cookie_consent", "accepted", { expires: 365 });
    setShowBanner(false);
  };

  const rejectCookies = () => {
    Cookies.set("cookie_consent", "rejected", { expires: 365 });
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="cookie-banner">
      <div className="cookie-text">
        <strong>We use cookies</strong> to improve your experience, analyze
        traffic, and enhance site performance.  
      </div>

      <div className="cookie-buttons">
        <button className="cookie-btn accept" onClick={acceptCookies}>
          Accept
        </button>

        <button className="cookie-btn reject" onClick={rejectCookies}>
          Reject
        </button>
      </div>
    </div>
  );
}
