"use client";

import React, { useEffect, useState, useRef, useMemo } from "react";
import "./Styles.css";
import Link from "next/link";
import Cookies from "js-cookie";
import PageLayout from "../components/PageLayout";
import { useSearchParams, useRouter } from "next/navigation";


export default function MenPage() {
  const [priceRange, setPriceRange] = useState({
    min: 0,
    max: 5000,
  });

  const searchParams = useSearchParams();
  const router = useRouter();

  const [isFilterOpen, setIsFilterOpen] = useState(false);

  /* ================= ✅ PRICE FORMAT ================= */
  function formatPrice(num) {
    return Number(num).toLocaleString("en-US");
  }

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredId, setHoveredId] = useState(null);

  // ✅ MEN CMS VIDEO STATE
  const [cmsVideo, setCmsVideo] = useState(null);

  const COOKIE_KEY = "men_products_cache";
  const mountedRef = useRef(false);



  useEffect(() => {
    document.body.style.overflow = isFilterOpen ? "hidden" : "auto";
  }, [isFilterOpen]);


  /* ================= ✅ MOUNT SAFETY ================= */
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  /* ================= ✅ LOAD MEN PRODUCTS ================= */
  useEffect(() => {
    const cached = Cookies.get(COOKIE_KEY);

    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        setProducts(parsed);
      } catch { }
    }

    async function refresh() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/products`
        );
        // df
        const data = await res.json();

        // ✅ MEN FILTER
        let menProducts = data.products.filter((p) =>
          p.gender?.includes("Men")
        );

        // ✅ ✅ ✅ OUT-OF-STOCK GOES DOWN
        menProducts = menProducts.sort((a, b) => {
          const aOut = Number(a.stockQuantity) <= 0;
          const bOut = Number(b.stockQuantity) <= 0;
          return aOut - bOut; // in-stock first
        });

        Cookies.set(COOKIE_KEY, JSON.stringify(menProducts), {
          expires: 1,
        });

        if (mountedRef.current) setProducts(menProducts);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    }

    refresh();
  }, []);

  /* ================= ✅ LOAD MEN PAGE VIDEO ================= */
  useEffect(() => {
    async function loadVideo() {
      try {
        const cachedVideo = Cookies.get("men_page_video");
        if (cachedVideo) {
          setCmsVideo(cachedVideo);
        }

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/cms-content/public`,
          { cache: "no-store" }
        );

        const data = await res.json();

        if (data?.menPageVideoUrl && mountedRef.current) {
          setCmsVideo(data.menPageVideoUrl);

          Cookies.set("men_page_video", data.menPageVideoUrl, {
            expires: 1,
          });
        }
      } catch (err) {
        console.warn("Men CMS video failed:", err);
      }
    }

    loadVideo();
  }, []);

  /* ================= ✅ IMAGE PICKER (HOVER ONLY) ================= */
  const pickImage = (p) => {
    const imgs = p.gallery?.length ? p.gallery : [p.imageUrl];
    if (hoveredId === p._id && imgs.length > 1) return imgs[1];
    return imgs[0];
  };

  /* ================= ✅ NOTIFY HANDLER ================= */
  const handleNotify = async (productId) => {
    const email = prompt("Enter your email to get restock notification:");
    if (!email) return;

    try {
      const API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;

      const res = await fetch(`${API_URL}/api/notify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productId, email }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      alert(data.message);
    } catch (err) {
      alert(err.message || "Notify failed");
    }
  };
  const doesProductMatchFilters = (p, params) => {
    const minPrice = Number(params.get("minPrice"));
    const maxPrice = Number(params.get("maxPrice"));
    const color = params.get("color");
    const size = params.get("size");
    const category = params.get("category");

    // PRICE
    const price = Number(p.price);
    if (!isNaN(minPrice) && price < minPrice) return false;
    if (!isNaN(maxPrice) && price > maxPrice) return false;

    // CATEGORY
    if (category && p.category?.toLowerCase() !== category.toLowerCase())
      return false;

    // COLOR
    // COLOR
    if (color) {
      if (!Array.isArray(p.variants)) return false;

      const hasColor = p.variants.some(
        (v) => v.color?.toLowerCase() === color
      );

      if (!hasColor) return false;
    }

    // SIZE
    if (size) {
      if (!Array.isArray(p.variants)) return false;

      const hasSize = p.variants.some(
        (v) => v.size === size
      );

      if (!hasSize) return false;
    }


    return true;
  };

  const hasActiveFilters = (params) => {
    return (
      params.get("minPrice") ||
      params.get("maxPrice") ||
      params.get("color") ||
      params.get("size") ||
      params.get("category")
    );
  };


  const prioritizedProducts = useMemo(() => {
    const params = searchParams;

    const hasAnyFilter =
      params.get("minPrice") ||
      params.get("maxPrice") ||
      params.get("color") ||
      params.get("size") ||
      params.get("category");

    // ✅ No filters → show all products normally
    if (!hasAnyFilter) return products;

    const matched = [];
    const unmatched = [];

    products.forEach((p) => {
      if (doesProductMatchFilters(p, params)) {
        matched.push(p);
      } else {
        unmatched.push(p);
      }
    });

    return [...matched, ...unmatched];
  }, [products, searchParams]);

  const matchedCount = useMemo(() => {
    if (!hasActiveFilters(searchParams)) return 0;

    return products.filter((p) =>
      doesProductMatchFilters(p, searchParams)
    ).length;
  }, [products, searchParams]);



  // const filteredProducts = useMemo(() => {
  //   let result = [...products];

  //   const minPrice = Number(searchParams.get("minPrice"));
  //   const maxPrice = Number(searchParams.get("maxPrice"));
  //   const color = searchParams.get("color");
  //   const size = searchParams.get("size");
  //   const category = searchParams.get("category");

  //   /* ===== PRICE FILTER ===== */
  //   result = result.filter((p) => {
  //     const price = Number(p.price);
  //     if (!isNaN(minPrice) && price < minPrice) return false;
  //     if (!isNaN(maxPrice) && price > maxPrice) return false;
  //     return true;
  //   });

  //   /* ===== CATEGORY ===== */
  //   if (category) {
  //     result = result.filter(
  //       (p) => p.category?.toLowerCase() === category.toLowerCase()
  //     );
  //   }

  //   /* ===== COLOR ===== */
  //   if (color) {
  //     result = result.filter((p) => {
  //       if (!p.color) return true;
  //       if (Array.isArray(p.color))
  //         return p.color.map((c) => c.toLowerCase()).includes(color);
  //       return p.color.toLowerCase() === color;
  //     });
  //   }

  //   /* ===== SIZE ===== */
  //   if (size) {
  //     result = result.filter((p) => {
  //       const allSizes = [
  //         ...(Array.isArray(p.sizes) ? p.sizes : p.sizes ? [p.sizes] : []),
  //         ...(Array.isArray(p.size) ? p.size : p.size ? [p.size] : []),
  //         ...(Array.isArray(p.variantSizes) ? p.variantSizes : []),
  //       ];
  //       if (!allSizes.length) return true;
  //       return allSizes.includes(size);
  //     });
  //   }

  //   return result;
  // }, [products, searchParams]);

  const dynamicFilters = useMemo(() => {
    const categories = new Set();
    const colorMap = new Map(); // key = normalized, value = display
    const sizes = new Set();

    products.forEach((p) => {
      // CATEGORY
      if (p.category) categories.add(p.category);

      // VARIANTS
      if (Array.isArray(p.variants)) {
        p.variants.forEach((v) => {
          // ✅ HANDLE COLORS (single, comma-separated, mixed case)
          if (v.color) {
            v.color
              .split(",")               // 👈 split "green, black"
              .map(c => c.trim())       // 👈 remove spaces
              .filter(Boolean)
              .forEach((c) => {
                const key = c.toLowerCase();
                if (!colorMap.has(key)) {
                  colorMap.set(key, c); // store readable version
                }
              });
          }

          // SIZE
          if (v.size) sizes.add(v.size);
        });
      }
    });

    return {
      categories: [...categories],
      colors: [...colorMap.values()], // ✅ CLEAN COLORS
      sizes: [...sizes],
    };
  }, [products]);




  const priceLimits = React.useMemo(() => {
    if (!products.length) return { min: 0, max: 1000 };

    const prices = products
      .map((p) => Number(p.price))
      .filter((p) => !isNaN(p));

    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
    };
  }, [products]);

  useEffect(() => {
    setPriceRange(priceLimits);
  }, [priceLimits]);

  useEffect(() => {
    const min = searchParams.get("minPrice");
    const max = searchParams.get("maxPrice");

    if (min || max) {
      setPriceRange({
        min: min ? Number(min) : priceLimits.min,
        max: max ? Number(max) : priceLimits.max,
      });
    }
  }, [searchParams, priceLimits]);

  /* ================= ✅ PRODUCT CARD ================= */
  const ProductCard = ({ p, isMatched }) => {

    const url = pickImage(p);
    const isOutOfStock = Number(p.stockQuantity) <= 0;

    return (
      <div
        className="gallery-item"
        onMouseEnter={() => setHoveredId(p._id)}
        onMouseLeave={() => setHoveredId(null)}
      >
        <div className="product-row">
          <Link href={`/product/${p._id}`}>
            <div className="img-wrapper notify-overlay-parent">


              <img
                src={url}
                alt={p.name}
                className="real-img"
                loading="lazy"
                style={{
                  filter: isOutOfStock ? "grayscale(0%)" : "none",
                  opacity: isOutOfStock ? 1 : 1,
                }}
              />

              {/* ✅ NOTIFY OVER IMAGE */}
              {isOutOfStock && (
                <button
                  onClick={() => handleNotify(p._id)}
                  className="notify-overlay-btn"
                >
                  Notify Me
                </button>
              )}
            </div>
          </Link>
        </div>

        <Link href={`/product/${p._id}`}>
          <p className="gallery-title">{p.name}</p>
          <p className="gallery-price">$ {formatPrice(p.price)}</p>
        </Link>
      </div>
    );
  };

  /* ================= ✅ FINAL DATA ================= */
  const firstFour = prioritizedProducts.slice(0, 4);
  const remaining = prioritizedProducts.slice(4);



  /* ================= ✅ SKELETON LOADER ================= */
  if (loading) {
    return (

      <section className="gallery">
        <div className="gallery-div reorder-animate">

          {Array(8)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="skeleton-card">
                <div className="skeleton-img" />
                <div className="skeleton-text" />
                <div className="skeleton-text small" />
              </div>
            ))}
        </div>
      </section>
    );
  }

  /* ================= ✅ FINAL MEN PAGE ================= */
  return (
    <PageLayout>
    <section className="gallery">
      <button className="open-filter-btn" onClick={() => setIsFilterOpen(true)}>
        FILTER
      </button>
      {matchedCount > 0 && (
        <div className="filter-result-count">
          Showing {matchedCount} matching products first
        </div>
      )}


      {isFilterOpen && (
        <div className="filter-backdrop" onClick={() => setIsFilterOpen(false)} />
      )}

      <div className={`filter-drawer ${isFilterOpen ? "open" : ""}`}>
        <div className="filter-header">
          <span>FILTERS</span>
          <button onClick={() => setIsFilterOpen(false)}>✕</button>
        </div>

        <div className="filter-content">
          {/* CATEGORY */}


          {/* ================= CATEGORY ================= */}
          {dynamicFilters.categories.length > 0 && (
            <div className="filter-section">
              <div className="filter-section-title">CATEGORY</div>

              <div className="filter-options">
                {dynamicFilters.categories.map((cat) => {
                  const isChecked =
                    searchParams.get("category")?.toLowerCase() === cat.toLowerCase();

                  return (
                    <label key={cat} className="filter-option">
                      <input
                        type="radio"
                        name="category"
                        checked={isChecked}
                        onChange={() => {
                          const p = new URLSearchParams(searchParams);
                          p.set("category", cat);
                          router.push(`?${p.toString()}`);
                        }}
                      />
                      {cat}
                    </label>
                  );
                })}
              </div>
            </div>
          )}


          {dynamicFilters.colors.length > 0 && (
            <div className="filter-section">
              <div className="filter-section-title">COLOR</div>

              <div className="color-grid">
                {dynamicFilters.colors.map((c) => {
                  const value = c.toLowerCase();
                  const isActive = searchParams.get("color") === value;

                  return (
                    <button
                      key={value}
                      className={`color-swatch ${isActive ? "active" : ""}`}
                      style={{ backgroundColor: value }}
                      title={c}
                      onClick={() => {
                        const p = new URLSearchParams(searchParams);

                        // toggle behavior
                        if (isActive) {
                          p.delete("color");
                        } else {
                          p.set("color", value);
                        }

                        router.push(`?${p.toString()}`);
                      }}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* ================= SIZE ================= */}
          {dynamicFilters.sizes.length > 0 && (
            <div className="filter-section">
              <div className="filter-section-title">SIZE</div>

              <div className="filter-size-grid">
                {dynamicFilters.sizes.map((s) => {
                  const isSelected = searchParams.get("size") === s;

                  return (
                    <button
                      key={s}
                      type="button"
                      className={`size-box ${isSelected ? "active" : ""}`}
                      onClick={() => {
                        const p = new URLSearchParams(searchParams);

                        // 🔁 Toggle behavior
                        if (isSelected) {
                          p.delete("size");
                        } else {
                          p.set("size", s);
                        }

                        router.push(`?${p.toString()}`);
                      }}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>
          )}





          {/* PRICE RANGE SLIDER */}
          <div className="filter-section">
            <div className="filter-section-title">
              <span>PRICE</span>
            </div>

            <div className="price-slider-wrapper">
              {/* RANGE TRACK */}
              <div className="price-track" />

              {/* ACTIVE RANGE */}
              <div
                className="price-range-active"
                style={{
                  left: `${((priceRange.min - priceLimits.min) /
                    (priceLimits.max - priceLimits.min)) *
                    100
                    }%`,
                  width: `${((priceRange.max - priceRange.min) /
                    (priceLimits.max - priceLimits.min)) *
                    100
                    }%`,
                }}
              />

              {/* MIN SLIDER */}
              <input
                type="range"
                min={priceLimits.min}
                max={priceLimits.max}
                value={priceRange.min}
                onChange={(e) =>
                  setPriceRange((prev) => ({
                    ...prev,
                    min: Math.min(Number(e.target.value), prev.max - 1),
                  }))
                }
                className="price-thumb"
              />

              {/* MAX SLIDER */}
              <input
                type="range"
                min={priceLimits.min}
                max={priceLimits.max}
                value={priceRange.max}
                onChange={(e) =>
                  setPriceRange((prev) => ({
                    ...prev,
                    max: Math.max(Number(e.target.value), prev.min + 1),
                  }))
                }
                className="price-thumb"
              />

              {/* LABELS */}
              <div className="price-labels">
                <div className="price-label">
                  <p>Min</p>
                  <span>${priceRange.min}</span>
                </div>

                <div className="price-label">
                  <p>Max</p>
                  <span>${priceRange.max}</span>
                </div>
              </div>

            </div>
          </div>


        </div>

        <div className="filter-footer">
          <button
            onClick={() => {
              setPriceRange(priceLimits);
              router.push("/men");
            }}
          >
            CLEAR
          </button>

          <button
            onClick={() => {
              const p = new URLSearchParams(searchParams);

              p.set("minPrice", String(priceRange.min));
              p.set("maxPrice", String(priceRange.max));

              router.push(`?${p.toString()}`);
              setIsFilterOpen(false);
            }}
          >
            APPLY
          </button>

        </div>
      </div>


      <div className="gallery-div reorder-animate">

        {firstFour.map((p) => (
          <ProductCard
            key={p._id}
            p={p}
            isMatched={
              hasActiveFilters(searchParams) &&
              doesProductMatchFilters(p, searchParams)
            }
          />

        ))}
      </div>

      <div className="gallery-video">
        {cmsVideo && (
          <video
            src={cmsVideo}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            fetchPriority="high"
            poster="/video-poster-Heritage.jpg"
            className="heritage-video"
          />
        )}
      </div>

      <div className="gallery-div reorder-animate section-two">

        {remaining.map((p) => (
          <ProductCard
            key={p._id}
            p={p}
            isMatched={
              hasActiveFilters(searchParams) &&
              doesProductMatchFilters(p, searchParams)
            }
          />

        ))}
      </div>
    </section>
</PageLayout>

  );
}
