"use client";

import React, { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import "./Styles.css";
import Link from "next/link";
import { IoClose } from "react-icons/io5";
import PageLayout from "../components/PageLayout";
/* ================= UTIL ================= */
function formatPrice(num) {
  return Number(num || 0).toLocaleString("en-US");
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get("query");

  const [products, setProducts] = useState([]);
  const [resultType, setResultType] = useState("");
  const [loading, setLoading] = useState(true);
  const [hoveredId, setHoveredId] = useState(null);
  const [history, setHistory] = useState([]);

  const mountedRef = useRef(false);

  /* ================= MOUNT SAFETY ================= */
  useEffect(() => {
    mountedRef.current = true;

    const stored = localStorage.getItem("search_history");
    if (stored) {
      setHistory(JSON.parse(stored));
    }

    return () => {
      mountedRef.current = false;
    };
  }, []);

  /* ================= SAVE SEARCH HISTORY ================= */
  useEffect(() => {
    if (!query) return;

    setHistory((prev) => {
      const updated = [query, ...prev.filter((q) => q !== query)].slice(0, 6);
      localStorage.setItem("search_history", JSON.stringify(updated));
      return updated;
    });
  }, [query]);

  /* ================= FETCH SEARCH ================= */
  useEffect(() => {
    if (!query) return;

    async function fetchSearch() {
      try {
        setLoading(true);

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/search?q=${query}`
        );

        const data = await res.json();

        if (mountedRef.current) {
          if (data.type === "exact") {
            setProducts(data.products);
            setResultType("exact");
          } else if (data.type === "related") {
            setProducts(data.products);
            setResultType("related");
          } else {
            setProducts([]);
            setResultType("none");
          }
        }
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    }

    fetchSearch();
  }, [query]);

  /* ================= IMAGE PICKER ================= */
  const pickImage = (p) => {
    const imgs = p.gallery?.length ? p.gallery : [p.imageUrl];
    if (hoveredId === p._id && imgs.length > 1) return imgs[1];
    return imgs[0];
  };

  /* ================= PRODUCT CARD ================= */
  const ProductCard = ({ p }) => {
    const url = pickImage(p);
    const [loaded, setLoaded] = useState(false);

    return (
      <div
        className="gallery-item"
        onMouseEnter={() => setHoveredId(p._id)}
        onMouseLeave={() => setHoveredId(null)}
      >
        <Link href={`/product/${p._id}`}>
          <div className="img-wrapper">
            <img
              src={url}
              alt={p.name}
              className={`real-img ${loaded ? "visible" : ""}`}
              loading="lazy"
              onLoad={() => setLoaded(true)}
            />
          </div>

          <p className="gallery-title">{p.name}</p>
          <p className="gallery-price">$ {formatPrice(p.price)}</p>
        </Link>
      </div>
    );
  };

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <section className="gallery">
        <div className="gallery-div">
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

  /* ================= PAGE ================= */
  return (
    <PageLayout>
      <section className="gallery">

        {/* SEARCH HEADER */}
        <div
          style={{
            padding: "20px 10px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h2 style={{ letterSpacing: "1px", fontSize: "12px" }}>
              SEARCH RESULTS FOR: "{query}"
            </h2>

            {resultType === "exact" && (
              <p style={{ fontSize: 11, marginTop: 6, color: "green" }}>
                Exact match found
              </p>
            )}

            {resultType === "related" && (
              <p style={{ fontSize: 11, marginTop: 6, color: "#888" }}>
                Showing related products
              </p>
            )}
          </div>

          {/* CLOSE BUTTON */}
          <button
            onClick={() => router.back()}
            style={{
              border: "none",
              background: "none",
              cursor: "pointer",
            }}
          >
            <IoClose size={28} />
          </button>
        </div>

        {/* RECENT SEARCHES */}
        {history.length > 0 && (
          <div style={{ padding: "10px 10px 30px" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <h4>Recent Searches</h4>
              <button
                onClick={() => {
                  localStorage.removeItem("search_history");
                  setHistory([]);
                }}
                style={{
                  background: "none",
                  border: "1px solid #000",
                  padding: "6px 12px",
                  cursor: "pointer",
                }}
              >
                Clear
              </button>
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 10 }}>
              {history.map((item, i) => (
                <Link
                  key={i}
                  href={`/search?query=${item}`}
                  style={{
                    padding: "6px 12px",
                    border: "1px solid #aaa",
                    textDecoration: "none",
                    color: "#000",
                  }}
                >
                  {item}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* RESULTS GRID */}
        {products.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center" }}>
            <h3>No products found</h3>
          </div>
        ) : (
          <div className="gallery-div">
            {products.map((p) => (
              <ProductCard key={p._id} p={p} />
            ))}
          </div>
        )}
      </section>
   </PageLayout>
      );
}