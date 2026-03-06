"use client";
import React from "react";
import "./luxury-loader.css";

export default function Loading() {
  return (
    <div className="luxury-loader">
      <div className="loader-logo">
        <h1 className="brand-name">KZARRĒ</h1>
      </div>
      <div className="loader-ring">
        <div className="ring"></div>
      </div>
    </div>
  );
}
