"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";

import './header.css'
// Icons
import {
  IoSearch,
  IoPersonOutline,
  IoBagOutline,
  IoMenu,
  IoClose,
} from "react-icons/io5";


/* ================================
      PRICE FORMATTER
================================ */
function formatPrice(num: number | string | undefined): string {
  return Number(num || 0).toLocaleString("en-US");
}

const Header = () => {
  /* ================================
        STATE
  ================================== */
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [resultType, setResultType] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const searchRef = useRef<HTMLDivElement | null>(null);


  const [authChecked, setAuthChecked] = useState(false);




  /* ================================
       LIVE SEARCH
  ================================== */
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setResultType("");
      return;
    }

    const delay = setTimeout(async () => {
      try {
        setSearchLoading(true);

    const res = await fetch(`/api/search?q=${searchQuery}`);

        const data = await res.json();

        if (data.type === "exact") {
          setSearchResults(data.products);
          setResultType("exact");
        } else if (data.type === "related") {
          setSearchResults(data.products);
          setResultType("related");
        } else {
          setSearchResults([]);
          setResultType("none");
        }
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setSearchLoading(false);
      }
    }, 300);

    return () => clearTimeout(delay);
  }, [searchQuery]);

  /* ================================
       CLICK OUTSIDE SEARCH CLOSE
  ================================== */
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        searchOpen &&
        searchRef.current &&
        !searchRef.current.contains(e.target as Node)
      ) {
        setSearchOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, [searchOpen]);

  /* ================================
       INLINE KEYFRAME ANIMATIONS
  ================================== */



  return (
    <>
      {/* ================= HEADER ================= */}
      <header className="header">
        <div className="container">
          {/* LEFT */}
          <div className="nav-left">
            <IoSearch
              size={20}
              className="desktop-search hide-mobile"
              onClick={() => setSearchOpen(true)}
            />

            <IoSearch
              size={20}
              className="mobile-search"
              onClick={() => setSearchOpen(true)}
              style={{ marginRight: "15px" }}
            />

            <Link href="/heritage" className="hide-mobile headerlink">HERITAGE</Link>
            <Link href="/women" className="hide-mobile headerlink">WOMEN</Link>
            <Link href="/men" className="hide-mobile headerlink">MEN</Link>
            <Link href="/accessories" className="hide-mobile headerlink">ACCESSORIES</Link>
          </div>

          {/* CENTER LOGO */}
          <div className="logo">
            <Link href="/home">
              <Image
                src="/Asset/logo.png"
                alt="KZARRĒ Logo"
                width={160}
                height={40}
                loading="eager"
                priority
                className="logo-img"
              />


            </Link>
          </div>

          {/* RIGHT */}
          <div className="nav-right">
            <Link href="/about" className="hide-mobile">ORIGIN STORY</Link>

            <Link href="/bag" className="hide-mobile">
              <IoBagOutline size={20} />
            </Link>

            <Link href="/profile" className="hide-mobile">
              <IoPersonOutline size={20} />
            </Link>

            <div
              className="mobile-menu-btn"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <IoClose size={22} /> : <IoMenu size={22} />}
            </div>
          </div>
        </div>
      </header>

      {/* ================= MOBILE MENU ================= */}
      <div className={`mobile-menu-overlay ${menuOpen ? "open" : ""}`}>
        <div className="mobile-nav-items">
          <Link href="/heritage" onClick={() => setMenuOpen(false)}>
            HERITAGE
          </Link>
          <Link href="/women" onClick={() => setMenuOpen(false)}>
            WOMEN
          </Link>
          <Link href="/men" onClick={() => setMenuOpen(false)}>
            MEN
          </Link>
          <Link href="/accessories" onClick={() => setMenuOpen(false)}>
            ACCESSORIES
          </Link>
        </div>
      </div>

      {/* ================= SEARCH OVERLAY ================= */}
      <div
        className={`search-overlay ${searchOpen ? "open" : ""}`}
        style={{
          animation: searchOpen ? "slideDown 0.35s ease" : "slideUp 0.35s ease",
        }}
        ref={searchRef}
      >
        <div className="search-box">
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />

          <button className="search-close" onClick={() => setSearchOpen(false)}>
            <IoClose size={32} color="#EFBF04" />
          </button>
        </div>

        {resultType === "exact" && (
          <p className="search-badge exact">Exact Match</p>
        )}
        {resultType === "related" && (
          <p className="search-badge related">Related Products</p>
        )}

        {/* RESULTS */}
        {searchQuery && (
          <div className="search-results">
            {searchLoading && <p className="search-loading">Searching...</p>}

            {!searchLoading && searchResults.length === 0 && (
              <p className="search-empty">No products found</p>
            )}

            {searchResults.map((item) => (
              <Link
                key={item._id}
                href={`/product/${item._id}`}
                className="search-product-card"
                onClick={() => setSearchOpen(false)}
              >
                <img src={item.imageUrl} alt={item.name} />
                <div>
                  <p>{item.name}</p>
                  <span>$ {formatPrice(item.price)}</span>
                </div>
              </Link>
            ))}
          </div>
        )}

        <button
          className="search-submit"
          onClick={() => {
            if (searchQuery.trim().length > 0) {
              window.location.href = `/search?query=${searchQuery}`;
            }
          }}
        >
          Search
        </button>
      </div>
    </>
  );
};

export default Header;
