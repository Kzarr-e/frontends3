"use client";
import React, { useState } from "react";
import "./Footer.css";
import Image from "next/image";
import Link from "next/link";
import logo from "../Assest/logo.png";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubscribe = async () => {
    if (!email || !email.includes("@")) {
      setStatus("error");
      setMessage("Please enter a valid email address.");
      return;
    }

    try {
      setStatus("loading");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/admin/campaign/subscribe`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      setStatus("success");
      setMessage("Thank you for subscribing!");
      setEmail("");
    } catch (err: any) {
      setStatus("error");
      setMessage(err.message || "Subscription failed.");
    }
  };

  return (
    <div className="footer">
      {/* LOGO */}
      <div className="footer-logo logo">
        <Link href="/home">
          <Image src={logo} alt="KZARRĒ Logo" className="logo-img" />
        </Link>
      </div>

      <div className="footer-content">
        {/* SUBSCRIBE */}
        <div className="footer-column-input">
          <h3>SUBSCRIBE TO OUR NEWSLETTER</h3>

          <input
            type="email"
            placeholder="Insert Your e-mail address"
            className="footer-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={status === "loading"}
          />

          <button
            onClick={handleSubscribe}
            className="footer-subscribe-btn"
            disabled={status === "loading"}
          >
            {status === "loading" ? "Submitting..." : "Subscribe"}
          </button>

          {message && (
            <p
              className={`footer-message ${
                status === "success" ? "success" : "error"
              }`}
            >
              {message}
            </p>
          )}

          <p className="footer-small-text">
            By clicking on “Subscribe”, you confirm that you have read and
            understood our <span>Privacy Statement</span>.
          </p>
        </div>

         {/* Help Section */}
        <div className="footer-column">
          <h3>DO YOU NEED HELP ?</h3>
          <ul>
           <Link href="/contact"><li>Contacts us</li></Link>
            <Link href="/faq"><li>FAQ</li></Link>
            
          </ul>
        </div>

        {/* Exclusive Services */}
        <div className="footer-column">
          <h3>Orders & Shipping</h3>
          <ul>
            <Link href="/orders"><li>Start a Return</li></Link>  
           <Link href="/shipping"><li>Shipping</li></Link>  
          </ul>
        </div>

        {/* Legal Terms */}
        <div className="footer-column">
          <h3>LEGAL TERMS AND CONDITIONS</h3>
          <ul>
            <Link href="/legal"><li>Legal & Privacy</li></Link>
              <Link href="/return-policy"><li>Return Policy</li></Link>
          </ul>
        </div>.   <div className="footer-column">
          <h3>About</h3>
          <ul>
           <Link href="/about"><li>About the Brand</li></Link>
             <Link href="/sustainability"><li>Sustainability</li></Link>
             <Link href="/accessibility"><li>Accessibility</li></Link>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-bottom-left">© KZARRĒ. 2025</div>
        <div className="footer-bottom-center">
          SHIPPING TO: UNITED STATES / ENGLISH
        </div>
        <div className="footer-bottom-right">STORE LOCATION</div>
      </div>
    </div>
  );
};

export default Footer;
