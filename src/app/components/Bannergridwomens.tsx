"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import "./fivegridBanner.css";

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
  style?: BannerStyle;
  shareLink?: string;
}

export default function MenBannerGrid() {
  const [grid, setGrid] = useState<GridItem[]>([]);
  const [fonts, setFonts] = useState<any[]>([]);

  /* ================= LOAD GRID + FONTS ================= */
useEffect(() => {
  const loadData = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/cms-content/public`
      );

      const data = await res.json();

      console.log("🔥 womenGrid:", data?.womenGrid);

      if (Array.isArray(data?.womenGrid)) {
        const cleaned = data.womenGrid.map((item: any) => {
          const clean = item._doc ? item._doc : item;

          return {
            imageUrl: clean.imageUrl || "",
            title: clean.title || "",
            description: clean.description || "",
            shareLink: clean.shareLink || "",
            style: clean.style || clean.bannerStyle || {},
          };
        });

        console.log("🔥 Cleaned Grid:", cleaned);

        setGrid(cleaned);
      }

      if (data?.fonts) {
        setFonts(data.fonts);
      }

    } catch (err) {
      console.error("Women Grid Load Error:", err);
    }
  };

  loadData();
}, []);
  /* ================= DYNAMIC FONT LOADER ================= */
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

    return () => {
      document.head.removeChild(styleTag);
    };
  }, [fonts]);

  /* ================= VALIDATION ================= */
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
          if (!item.imageUrl) return null; // 🔥 prevent empty src crash

          const s = item.style || {};

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

          const finalLink = item.shareLink?.trim() || "";
          const isExternal =
            finalLink.startsWith("http://") ||
            finalLink.startsWith("https://");

          const BannerContent = (
            <>
              <img
                src={item.imageUrl}
                alt={item.title || "Banner"}
                className="banner-img"
                loading="lazy"   // 🔥 performance boost
              />

              {item.title && (
                <h3 className="banner-title" style={titleStyle}>
                  {item.title}
                </h3>
              )}

              {item.description && (
                <p className="banner-description" style={descStyle}>
                  {item.description}
                </p>
              )}
            </>
          );

          return (
            <div
              key={index}
              className={`banner-item ${layoutClasses[index]}`}
            >
              {finalLink ? (
                isExternal ? (
                  <a
                    href={finalLink}
                    rel="noopener noreferrer"
                    className="banner-link"
                  >
                    {BannerContent}
                  </a>
                ) : (
                  <Link href={finalLink} className="banner-link">
                    {BannerContent}
                  </Link>
                )
              ) : (
                BannerContent
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}