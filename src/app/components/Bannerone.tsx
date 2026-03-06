"use client";

import React, { useEffect, useState } from "react";
import "./Banner.css";
import Link from "next/link";

interface BannerStyle {
  titleColor?: string;
  titleSize?: string;
  descColor?: string;
  descSize?: string;
  alignment?: "left" | "center" | "right";
  fontFamily?: string;
}

interface BannerItem {
  image?: string;
  title?: string;
  description?: string;
  style?: BannerStyle;
  shareLink?: string;
}

export default function Bannerone() {
  const [banner, setBanner] = useState<BannerItem | null>(null);
  const [fonts, setFonts] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/cms-content/public`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.banners?.bannerOne) setBanner(data.banners.bannerOne);
        if (data?.fonts) setFonts(data.fonts);
      })
      .catch((err) => console.error("BannerOne Error:", err));
  }, []);

  // Load uploaded fonts
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


  if (!banner) return null;

  const s = banner.style || {};

  // Only apply inline style if admin set it
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

  const containerStyle: React.CSSProperties = {
    ...(s.alignment ? { textAlign: s.alignment } : {}),
  };

  const finalLink = banner.shareLink?.trim() || "";
  const isExternal =
    finalLink.startsWith("http://") ||
    finalLink.startsWith("https://");

  return (
    <div className="main">
      <div className="borderone" style={containerStyle}>
        {finalLink ? (
          isExternal ? (
            <a
              href={finalLink}
             
              rel="noopener noreferrer"
              className="block"
            >
              <div className="bone-frame">
                {banner.image ? (
                  <img
                    src={banner.image}
                    alt={banner.title || "Banner One"}
                    className="bone"
                  />
                ) : (
                  <div className="bone-placeholder" />
                )}
              </div>

              <h3 className="banner-title lsp-3" style={titleStyle}>
                {banner.title}
              </h3>

              <p className="banner-desc lsp-3" style={descStyle}>
                {banner.description}
              </p>
            </a>
          ) : (
            <Link href={finalLink} className="block">
              <div className="bone-frame">
                {banner.image ? (
                  <img
                    src={banner.image}
                    alt={banner.title || "Banner One"}
                    className="bone"
                  />
                ) : (
                  <div className="bone-placeholder" />
                )}
              </div>

              <h3 className="banner-title lsp-3" style={titleStyle}>
                {banner.title}
              </h3>

              <p className="banner-desc lsp-3" style={descStyle}>
                {banner.description}
              </p>
            </Link>
          )
        ) : (
          <>
            <div className="bone-frame">
              {banner.image ? (
                <img
                  src={banner.image}
                  alt={banner.title || "Banner One"}
                  className="bone"
                />
              ) : (
                <div className="bone-placeholder" />
              )}
            </div>

            <h3 className="banner-title lsp-3" style={titleStyle}>
              {banner.title}
            </h3>

            <p className="banner-desc lsp-3" style={descStyle}>
              {banner.description}
            </p>
          </>
        )}
      </div>
    </div>
  );
}