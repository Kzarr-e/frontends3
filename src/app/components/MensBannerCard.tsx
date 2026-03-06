"use client";

import React, { useEffect, useState } from "react";
import "./FourImageGrid.css";
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
  style?: BannerStyle;
  shareLink?: string;
}

const MensBannerCard: React.FC = () => {
  const [banners, setBanners] = useState<GridItem[]>([]);
  const [fonts, setFonts] = useState<any[]>([]);

  /* ---------------- Load CMS banners + fonts ---------------- */
  useEffect(() => {
    const fetchGrid = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/cms-content/public`
        );

        const data = await res.json();
        console.log("MEN GRID:", data);

        if (Array.isArray(data?.men4Grid) && data.men4Grid.length > 0) {
          const parentStyle = data.men4Grid[0]?.$__parent?.bannerStyle || {};

          const prepared = data.men4Grid.map((item: any) => ({
            imageUrl: item._doc?.imageUrl || "",
            title: item._doc?.title || "",
            description: item._doc?.description || "",
            shareLink: item.shareLink || item._doc?.shareLink || "",
            style: {
              titleColor: parentStyle.titleColor,
              titleSize: parentStyle.titleSize,
              descColor: parentStyle.descColor,
              descSize: parentStyle.descSize,
              alignment: parentStyle.alignment,
              fontFamily: parentStyle.titleFont || undefined,
            },
          }));

          setBanners(prepared);
        }

        if (Array.isArray(data?.fonts)) {
          setFonts(data.fonts);
        }
      } catch (err) {
        console.error("Failed to load men 4-grid CMS:", err);
      }
    };

    fetchGrid();
  }, []);


  /* ---------------- Inject uploaded fonts dynamically ---------------- */
  useEffect(() => {
    if (!fonts.length) {
      return; // <-- valid void return
    }

    const styleTag = document.createElement("style");

    styleTag.innerHTML = fonts
      .map(
        (font: any) => `
        @font-face {
          font-family: '${font.name}';
          src: url('${font.url}');
        }
      `
      )
      .join("");

    document.head.appendChild(styleTag);

    // Cleanup MUST be returned only if styleTag was added
    return () => {
      document.head.removeChild(styleTag);
    };
  }, [fonts]);


  /* ---------------- Image URL resolver ---------------- */
  const resolveImageUrl = (url?: string): string => {
    if (!url) return "/placeholder.png";
    if (url.startsWith("http")) return url;
    return `${process.env.NEXT_PUBLIC_BACKEND_API_URL}${url}`;
  };

  /* ---------------- MAIN BANNER STYLE FALLBACK ---------------- */
  const parentStyle: BannerStyle = banners[0]?.style || {};

  return (
    <div className="four-image-grid-wrapper">
      {(banners.length > 0 ? banners : Array(4).fill(null)).map(
        (banner, index) => {
          // Use item style → otherwise fallback to the main bannerStyle
          const s: BannerStyle = banner?.style || parentStyle || {};

          const alignment = s.alignment || "left";

          const titleStyle: React.CSSProperties = {
            ...(s.titleColor && { color: s.titleColor }),
            ...(s.titleSize && { fontSize: s.titleSize }),
            ...(s.fontFamily && { fontFamily: s.fontFamily }),
            textAlign: alignment,
          };

          const descStyle: React.CSSProperties = {
            ...(s.descColor && { color: s.descColor }),
            ...(s.descSize && { fontSize: s.descSize }),
            ...(s.fontFamily && { fontFamily: s.fontFamily }),
            textAlign: alignment,
          };
const finalLink = banner?.shareLink?.trim() || "";
const isExternal =
  finalLink.startsWith("http://") ||
  finalLink.startsWith("https://");
          return (
            <div key={index} className="grid-item">
              {finalLink ? (
                isExternal ? (
                  <a
                    href={finalLink}
                   
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <img
                      src={resolveImageUrl(banner?.imageUrl)}
                      alt={banner?.title || "Men Banner"}
                      className="grid-image"
                    />

                    <div className="grid-text lsp-3" style={{ textAlign: alignment }}>
                      <h3 style={titleStyle}>{banner?.title || ""}</h3>
                      <p style={descStyle}>{banner?.description || ""}</p>
                    </div>
                  </a>
                ) : (
                  <Link href={finalLink} className="block">
                    <img
                      src={resolveImageUrl(banner?.imageUrl)}
                      alt={banner?.title || "Men Banner"}
                      className="grid-image"
                    />

                    <div className="grid-text lsp-3" style={{ textAlign: alignment }}>
                      <h3 style={titleStyle}>{banner?.title || ""}</h3>
                      <p style={descStyle}>{banner?.description || ""}</p>
                    </div>
                  </Link>
                )
              ) : (
                <>
                  <img
                    src={resolveImageUrl(banner?.imageUrl)}
                    alt={banner?.title || "Men Banner"}
                    className="grid-image"
                  />

                  <div className="grid-text lsp-3" style={{ textAlign: alignment }}>
                    <h3 style={titleStyle}>{banner?.title || ""}</h3>
                    <p style={descStyle}>{banner?.description || ""}</p>
                  </div>
                </>
              )}
            </div>
          );
        }
      )}
    </div>
  );
};

export default MensBannerCard;
