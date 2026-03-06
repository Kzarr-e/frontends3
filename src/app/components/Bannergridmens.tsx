"use client";

import React, { useEffect, useState } from "react";
import "./fivegridBanner.css";
import Link from "next/link";
interface BannerStyle {
  titleColor?: string;
  titleSize?: string;
  descColor?: string;
  descSize?: string;
  alignment?: "left" | "center" | "right";
  fontFamily?: string;
}

interface GridItem {
  imageUrl: string;
  title?: string;
  description?: string;
  style?: BannerStyle; // 👈 added
  shareLink?: string; 
}

export default function MenBannerGrid() {
  const [grid, setGrid] = useState<GridItem[]>([]);
  const [fonts, setFonts] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/cms-content/public`
        );

        const data = await res.json();

        if (Array.isArray(data?.menGrid)) {
          setGrid(data.menGrid);
        }

        if (data?.fonts) {
          setFonts(data.fonts);
        }
      } catch (err) {
        console.error("Men Grid Load Error:", err);
      }
    };

    loadData();
  }, []);

  // Load uploaded fonts dynamically
useEffect(() => {
  if (!fonts.length) return;

  const styleTag = document.createElement("style");
  let css = "";

  fonts.forEach((font) => {
    css += `
      @font-face {
        font-family: '${font.name}';
        src: url('${font.url}');
      }
    `;
  });

  styleTag.innerHTML = css;
  document.head.appendChild(styleTag);

  // CLEANUP MUST RETURN void
  return () => {
    document.head.removeChild(styleTag);
  };
}, [fonts]);


  // If not exactly 5 banners → hide
  if (grid.length !== 5) return null;

  const layoutClasses = [
    "banner-left-top",
    "banner-left-bottom",
    "banner-center",
    "banner-right-top",
    "banner-right-bottom",
  ];

  return (
    <div className="banner-containerid">
      <div className="banner-wrapper">
        {grid.map((item, index) => {
          const s = item.style || {};

          // Apply ONLY admin-set values (do NOT override CSS defaults)
          const titleStyle: React.CSSProperties = {
            ...(s.titleColor ? { color: s.titleColor } : {}),
            ...(s.titleSize ? { fontSize: s.titleSize } : {}),
            ...(s.fontFamily ? { fontFamily: s.fontFamily } : {}),
            ...(s.alignment ? { textAlign: s.alignment } : {}),
          };

          const descStyle: React.CSSProperties = {
            ...(s.descColor ? { color: s.descColor } : {}),
            ...(s.descSize ? { fontSize: s.descSize } : {}),
            ...(s.fontFamily ? { fontFamily: s.fontFamily } : {}),
            ...(s.alignment ? { textAlign: s.alignment } : {}),
          };

          return (
            <div key={index} className={`banner-item ${layoutClasses[index]}`}>
              <img
                src={item.imageUrl}
                alt={item.title || "Banner"}
                className="banner-img"
              />

              {/* TITLE — visible only if admin added it */}
              {item.title && (
                <h3 className="banner-title" style={titleStyle}>
                  {item.title}
                </h3>
              )}

              {/* DESCRIPTION */}
              {item.description && (
                <p className="banner-description" style={descStyle}>
                  {item.description}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
