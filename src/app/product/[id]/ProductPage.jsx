"use client";

import React, {
  useEffect,
  useState,
  useMemo,
  useRef,
} from "react";
import { Forward } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import "./product.css";
import { addToCart } from "../../utils/addToCart";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";
import Pagelayout from "../../components/PageLayout";

/* ==================== HELPERS ==================== */
function formatPrice(num) {
  return Number(num).toLocaleString("en-US");
}

async function safeJson(res) {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return {};
  }
}

export default function ProductPage({ id }) {

  /* ================= STATE ================= */
  const [product, setProduct] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [adding, setAdding] = useState(false);

  /* IMAGE */
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollLock = useRef(false);
  const touchStartY = useRef(0);
  const [subscribed, setSubscribed] = useState(false);

  const cart = typeof window !== "undefined"
    ? JSON.parse(localStorage.getItem("cart") || "[]")
    : [];

  const currentItem = cart.find(
    (i) =>
      i.productId === product?._id &&
      i.size === selectedSize &&
      i.color === selectedColor
  );

  const currentQty = currentItem?.quantity || 0;

  const totalQty = cart.reduce((sum, i) => sum + i.quantity, 0);

  const isItemMax = currentQty >= 5;
  const isCartMax = totalQty >= 20;
  /* ================= FETCH PRODUCT ================= */
  useEffect(() => {
    if (!id) return;

    async function load() {
      setLoading(true);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/products/${id}`
      );
      const parsed = await safeJson(res);

      if (!parsed?.product) {
        setLoading(false);
        return;
      }

      const p = parsed.product;

      const normalized = {
        _id: p._id,
        name: p.name,
        description: p.description,
        price: p.price,
        discountPrice: p.discountPrice || null,
        gallery: Array.isArray(p.gallery) ? p.gallery : [p.imageUrl],
        imageUrl: p.imageUrl,
        variants: p.variants || [],
        category: p.category,
        stockQuantity: p.stockQuantity,
      };

      setProduct(normalized);

      const notifyKey = `notify_${normalized._id}_${selectedSize}_${selectedColor}`;

      const alreadySubscribed = localStorage.getItem(notifyKey);
      setSubscribed(alreadySubscribed === "true");

      setCurrentIndex(0);
      setLoading(false);
    }

    load();
  }, [id]);

  useEffect(() => {
    if (!product || !selectedSize || !selectedColor) return;

    const notifyKey = `notify_${product._id}_${selectedSize}_${selectedColor}`;
    const alreadySubscribed = localStorage.getItem(notifyKey);

    setSubscribed(alreadySubscribed === "true");
  }, [product, selectedSize, selectedColor]);


  useEffect(() => {
    if (!product?.category) return;

    async function loadSimilar() {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/products`
      );
      const data = await safeJson(res);

      if (!data?.products) return;

      const related = data.products
        .filter(
          (p) => p.category === product.category && p._id !== product._id
        )
        .slice(0, 8);

      setSimilar(related);
    }

    loadSimilar();
  }, [product]);

  /* ================= VARIANT NORMALIZATION ================= */
  const variantMap = useMemo(() => {
    if (!product?.variants) {
      return { sizes: [], colors: [], sizeColorMap: {} };
    }

    const sizesSet = new Set();
    const colorsSet = new Set();
    const sizeColorMap = {};

    product.variants.forEach((v) => {
      if (!v.size || !v.color) return;

      const size = v.size.trim();
      const color = v.color.trim();

      sizesSet.add(size);
      colorsSet.add(color);

      if (!sizeColorMap[size]) sizeColorMap[size] = [];
      if (!sizeColorMap[size].includes(color)) {
        sizeColorMap[size].push(color);
      }
    });

    return {
      sizes: Array.from(sizesSet),
      colors: Array.from(colorsSet), // ✅ UNIQUE COLORS
      sizeColorMap,
    };
  }, [product]);

  const { sizes, colors, sizeColorMap } = variantMap;

  /* ================= AVAILABLE COLORS BY SIZE ================= */
  const availableColors = useMemo(() => {
    if (!selectedSize) return colors;
    return sizeColorMap[selectedSize] || [];
  }, [selectedSize, colors, sizeColorMap]);

  /* ================= AUTO FIX INVALID COLOR ================= */
  useEffect(() => {
    if (!selectedSize) return;

    if (!availableColors.includes(selectedColor)) {
      setSelectedColor(availableColors[0] || "");
    }
  }, [selectedSize, availableColors, selectedColor]);

  /* ================= ADD TO CART ================= */
  const handleAddToCart = async () => {
    if (!selectedSize) return alert("Select size");
    if (!selectedColor) return alert("Select color");

    setAdding(true);

    const token = localStorage.getItem("kzarre_token");
    const isGuest = !token;

    const item = {
      productId: product._id,
      name: product.name,
      price: product.discountPrice || product.price,
      image: product.imageUrl,
      quantity: 1,
      size: selectedSize,
      color: selectedColor,
    };

    if (isGuest) {
      // 🔥 LOCAL STORAGE CART
      const existing = JSON.parse(localStorage.getItem("cart") || "[]");

      const found = existing.find(
        (i) =>
          i.productId === item.productId &&
          i.size === item.size &&
          i.color === item.color
      );
      // 🔥 PER ITEM LIMIT
      if (found) {
        if (found.quantity >= 5) {
          return alert("Max 5 allowed per item");
        }
        found.quantity += 1;
      } else {
        existing.push(item);
      }

      localStorage.setItem("cart", JSON.stringify(existing));
      setAdded(true);

      // trigger cart update event
      window.dispatchEvent(new Event("cartUpdated"));

      setTimeout(() => {
        setAdded(false);
      }, 1500);
    } else {
      // 🔥 API CART (LOGGED IN)
      await addToCart({
        _id: product._id,
        name: product.name,
        price: product.discountPrice || product.price,
        image: product.imageUrl,
        size: selectedSize,
        color: selectedColor,
        qty: 1,
      });

      // ✅ ADD FEEDBACK SAME AS GUEST
      setAdded(true);
      window.dispatchEvent(new Event("cartUpdated"));

      setTimeout(() => {
        setAdded(false);
      }, 1500);
    }

    setAdding(false);
  };

  const handleBuyNow = () => {
    if (!selectedSize) return alert("Please select a size");
    if (!selectedColor) return alert("Please select a color");

    const url = `/checkout?product=${product._id}&qty=1&size=${encodeURIComponent(
      selectedSize
    )}&color=${encodeURIComponent(selectedColor)}`;

    window.location.href = url;
  };

  const handleNotify = async () => {
    try {
      // ✅ Only validate if options exist
      if (product?.sizes?.length > 0 && !selectedSize) {
        return alert("Please select a size");
      }

      if (product?.colors?.length > 0 && !selectedColor) {
        return alert("Please select a color");
      }

      const API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;

      const userRaw = localStorage.getItem("kzarre_user");
      const user = userRaw ? JSON.parse(userRaw) : null;
      const email = user?.email;

      if (!email) {
        return alert("Please login to get stock notifications.");
      }

      const notifyKey = `notify_${product._id}_${selectedSize}_${selectedColor}`;

      if (localStorage.getItem(notifyKey) === "true") {
        return alert("You are already subscribed for this variant.");
      }

      const res = await fetch(`${API_URL}/api/notify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product._id,
          size: selectedSize,
          color: selectedColor,
          email,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Notify failed");

      localStorage.setItem(notifyKey, "true");
      setSubscribed(true);

      alert(
        `You will be notified when ${selectedSize} / ${selectedColor} is back in stock.`
      );
    } catch (err) {
      alert(err.message || "Notify failed");
    }
  };

  /* ================= IMAGE SWIPE ================= */
  const handleTouchStart = (e) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e) => {
    if (scrollLock.current || !product?.gallery?.length) return;

    scrollLock.current = true;
    const diff = touchStartY.current - e.changedTouches[0].clientY;

    if (diff > 50) {
      setCurrentIndex((i) => (i + 1) % product.gallery.length);
    } else if (diff < -50) {
      setCurrentIndex(
        (i) => (i - 1 + product.gallery.length) % product.gallery.length
      );
    }

    setTimeout(() => (scrollLock.current = false), 600);
  };

  if (loading || !product) {
    return <div className="loading">Loading…</div>;
  }

  const priceNow =
    product.discountPrice && product.discountPrice > 0
      ? product.discountPrice
      : product.price;

  const isOutOfStock = Number(product.stockQuantity) <= 0;

  /* ================= IMAGE ARROWS ================= */
  const showPrevImage = () => {
    if (!product?.gallery?.length) return;
    setCurrentIndex((i) =>
      i === 0 ? product.gallery.length - 1 : i - 1
    );
  };

  const showNextImage = () => {
    if (!product?.gallery?.length) return;
    setCurrentIndex((i) =>
      (i + 1) % product.gallery.length
    );
  };
  return (
    <Pagelayout>
      <main className="product-page">
        <div className="product-top">
          {/* IMAGE */}
          <div
            className="main-image"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {/* LEFT ARROW */}
            <button
              className="img-arrow left"
              onClick={() =>
                setCurrentIndex(
                  (i) => (i - 1 + product.gallery.length) % product.gallery.length
                )
              }
              aria-label="Previous image"
            >
              <IoChevronBack />
            </button>
            <img
              src={product.gallery[currentIndex]}
              alt={product.name}
              className="luxury-img"
            />

            {/* RIGHT ARROW */}
            <button
              className="img-arrow right"
              onClick={() =>
                setCurrentIndex((i) => (i + 1) % product.gallery.length)
              }
              aria-label="Next image"
            >
              <IoChevronForward />
            </button>
          </div>

          {/* INFO */}
          <aside className="info-col">
            <h1 className="product-title">{product.name}</h1>
            <p className="subtitle">{product.description}</p>
            <div className="price-current">$ {formatPrice(priceNow)}</div>


            {/* SIZE */}
            {sizes.length > 0 && (
              <div className="variant-group">
                <p className="variant-label">Size</p>
                <div className="variant-options">
                  {sizes.map((size) => (
                    <button
                      key={size}
                      className={`variant-btn ${selectedSize === size ? "active" : ""
                        }`}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* COLOR */}
            {colors.length > 0 && (
              <div className="variant-group">
                <p className="variant-label">Color</p>
                <div className="color-options">
                  {colors.map((color) => {
                    const disabled =
                      selectedSize && !availableColors.includes(color);

                    return (
                      <button
                        key={color}
                        className={`color-swatch
                          ${selectedColor === color ? "active" : ""}
                          ${disabled ? "disabled" : ""}
                          ${color.toLowerCase() === "white" ? "light" : ""}
                        `}
                        style={{ "--swatch-color": color }}
                        disabled={disabled}
                        onClick={() => !disabled && setSelectedColor(color)}
                        aria-label={color}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {/* ACTIONS */}
            <div className="actions">
              {!isOutOfStock ? (
                <>
                  <button
                    className="btn primary"
                    onClick={handleBuyNow}
                  >
                    Buy Now
                  </button>

                  <button
                    className={`btn outline ${isItemMax || isCartMax ? "disabledBtn" : ""}`}
                    onClick={handleAddToCart}
                    disabled={adding || isItemMax || isCartMax}
                    title={
                      isCartMax
                        ? "Cart limit reached (20 items)"
                        : isItemMax
                          ? "Max 5 per item"
                          : "Add to cart"
                    }
                  >
                    {isCartMax
                      ? "Cart Full"
                      : isItemMax
                        ? "Max Reached"
                        : adding
                          ? "Adding..."
                          : "Add to Cart"}
                  </button>
                </>
              ) : (
                <div className="actions">
                  {!isOutOfStock ? (
                    <>
                      <button
                        className="btn primary"
                        onClick={handleBuyNow}
                      >
                        Buy Now
                      </button>
                      <button
                        className={`btn outline ${isItemMax || isCartMax ? "disabledBtn" : ""}`}
                        onClick={handleAddToCart}
                        disabled={adding || isItemMax || isCartMax}
                        title={
                          isCartMax
                            ? "Cart limit reached (20 items)"
                            : isItemMax
                              ? "Max 5 per item"
                              : "Add to cart"
                        }
                      >
                        {isCartMax
                          ? "Cart Full"
                          : isItemMax
                            ? "Max Reached"
                            : adding
                              ? "Adding..."
                              : "Add to Cart"}
                      </button>
                    </>
                  ) : (
                    <>
                      <p className="out-stock">
                        This product is currently out of stock
                      </p>
                      <button
                        className="btn outline"
                        onClick={handleNotify}
                        disabled={subscribed}
                        style={{
                          opacity: subscribed ? 0.5 : 1,
                          cursor: subscribed ? "not-allowed" : "pointer",
                        }}
                      >
                        {subscribed ? "Subscribed" : "Notify Me"}
                      </button>


                    </>
                  )}
                </div>

              )}
            </div>
            <div className="variant-group">
              
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert("Product link copied!");
                }}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "black",
                }}
              > 
                 <Forward size={18} />
              </button>
            </div>
          </aside>
        </div>

        {/* SIMILAR */}
        {Array.isArray(similar) && similar.length > 0 && (
          <section className="similar-section">
            <h2>Similar Products</h2>
            <div className="similar-grid">
              {similar.map((p) => {
                const img =
                  p.imageUrl ||
                  (Array.isArray(p.gallery) && p.gallery[0]) ||
                  "/placeholder.png"; // fallback

                return (
                  <Link
                    key={p._id}
                    href={`/product/${p._id}`}
                    className="card"
                  >
                    <div className="card-image">
                      <img src={img} alt={p.name || "Product"} />
                    </div>

                    <div className="card-body">
                      <div className="card-title">{p.name}</div>
                      <div className="card-price">
                        $ {formatPrice(p.price)}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

      </main>
    </Pagelayout>

  );
}
