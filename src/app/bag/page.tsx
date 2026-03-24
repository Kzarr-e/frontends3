"use client";

import React, { useEffect, useState } from "react";
import styles from "./bagsection.module.css";
import { FiTrash2 } from "react-icons/fi";
import { useRouter } from "next/navigation";
import PageLayout from "../components/PageLayout";
const API = process.env.NEXT_PUBLIC_BACKEND_API_URL;

interface CartItem {
  productId: string;
  name: string;
  description?: string;
  image: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
}

export default function BagSection() {
  const router = useRouter();


  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const token = typeof window !== "undefined"
    ? localStorage.getItem("kzarre_token")
    : null;

  const isGuest = !token;
  /* =========================
     FETCH CART
  ========================= */
  useEffect(() => {
    fetchCart();
  }, []);

  useEffect(() => {
    const handler = () => fetchCart();

    window.addEventListener("cartUpdated", handler);

    return () => window.removeEventListener("cartUpdated", handler);
  }, []);

  const fetchCart = async () => {
    try {
      if (isGuest) {
        // ✅ LOAD FROM LOCALSTORAGE
        const localCart: CartItem[] = JSON.parse(
          localStorage.getItem("cart") || "[]"
        );
        setCart(localCart);
        setLoading(false);
        return;
      }

      // ✅ USER CART (API)
      const res = await fetch(`${API}/api/cart`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        setCart([]);
        return;
      }

      const data = await res.json();
      setCart(data.items || []);
    } catch (err) {
      console.error("Failed to load cart", err);
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     UPDATE QTY
  ========================= */
  const updateQty = async (
    productId: string,
    qty: number,
    size?: string,
    color?: string
  ) => {
    if (qty < 1) return;

    // 🔥 LIMIT PER ITEM
    if (qty > 5) {
      alert("Max 5 allowed per item");
      return;
    }

    try {
      if (isGuest) {
        const localCart: CartItem[] = JSON.parse(
          localStorage.getItem("cart") || "[]"
        );

        // 🔥 TOTAL CART LIMIT
        const totalQty = localCart.reduce((sum, i) => sum + i.quantity, 0);
        const currentItem = localCart.find(
          (i) =>
            i.productId === productId &&
            i.size === size &&
            i.color === color
        );

        const otherQty = totalQty - (currentItem?.quantity || 0);

        if (otherQty + qty > 20) {
          alert("Cart limit is 20 items");
          return;
        }

        const updated = localCart.map((item) =>
          item.productId === productId &&
            item.size === size &&
            item.color === color
            ? { ...item, quantity: qty }
            : item
        );

        localStorage.setItem("cart", JSON.stringify(updated));
        setCart(updated);
      } else {
        // (same logic ideally backend too)
        await fetch(`${API}/api/cart/update`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ productId, quantity: qty }),
        });

        fetchCart();
      }
    } catch (err) {
      console.error("Update failed", err);
    }
  };

  /* =========================
     REMOVE ITEM
  ========================= */
  const removeItem = async (productId: string, size?: string,
    color?: string) => {
    try {
      if (isGuest) {
        const localCart: CartItem[] = JSON.parse(
  localStorage.getItem("cart") || "[]"
);

        const updated = localCart.filter(
          (item) =>
            !(
              item.productId === productId &&
              item.size === size &&
              item.color === color
            )
        );

        localStorage.setItem("cart", JSON.stringify(updated));
        setCart(updated);
      } else {
        await fetch(`${API}/api/cart/remove`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            productId,
            size,
            color,
          }),
        });

        fetchCart();
      }
    } catch (err) {
      console.error("Remove failed", err);
    }
  };

  /* =========================
     GO TO CHECKOUT (NO ORDER CREATE)
  ========================= */
  const goToCheckout = () => {
    router.push("/checkout/");
  };

  /* =========================
     CALCULATIONS
  ========================= */
  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );



  if (loading) {
    return <p style={{ padding: 40 }}>Loading cart...</p>;
  }

  return (
    <PageLayout>
      <>
        <section className={styles.cartContainer}>
          {/* LEFT */}
          <div className={styles.left}>
            {cart.length === 0 && <p>Your cart is empty</p>}

            {cart.map((item) => {
              const isMax = item.quantity >= 5;

              return (
                <div
                  key={`${item.productId}-${item.size}-${item.color}`}
                  className={styles.cartItem}
                >
                  <div className={styles.itemImg}>
                    <img
                      src={item.image}
                      alt={item.name}
                      width={100}
                      height={100}
                    />
                  </div>

                  <div className={styles.itemInfo}>
                    <h3>{item.name}</h3>

                    {item.description && <p>{item.description}</p>}

                    <p className={styles.price}>${item.price}</p>

                    <div className={styles.details}>
                      <span>Size: {item.size || ""}</span>
                      <span>Color: {item.color || ""}</span>

                      <span>
                        Qty:
                        <input
                          type="number"
                          min={1}
                          max={5}
                          value={item.quantity}
                          title={isMax ? "Max 5 per item" : ""}
                          onChange={(e) => {
                            let value = Number(e.target.value);

                            // 🔥 clamp value between 1 and 5
                            if (value > 5) value = 5;
                            if (value < 1) value = 1;

                            updateQty(
                              item.productId,
                              value,
                              item.size,
                              item.color
                            );
                          }}
                        />
                      </span>
                    </div>

                    {/* ✅ OPTIONAL UX */}
                    {isMax && (
                      <p style={{ color: "red", fontSize: "12px" }}>
                        Max 5 per item
                      </p>
                    )}
                  </div>

                  <button
                    className={styles.deleteBtn}
                    onClick={() =>
                      removeItem(item.productId, item.size, item.color)
                    }
                  >
                    <FiTrash2 size={18} />
                  </button>
                </div>
              );
            })}
          </div>

          {/* RIGHT */}
          <div className={styles.right}>
            <div className={styles.summaryBox}>
              <h3>Order Summary</h3>

              <div className={styles.row}>
                <span>Subtotal</span>
                <span>${subtotal.toFixed(0)}</span>
              </div>

              <div className={`${styles.row} ${styles.totalRow}`}>
                <strong>Total</strong>
                <strong>${subtotal.toFixed(0)}</strong>
              </div>

              <button
                className={styles.checkoutBtn}
                onClick={goToCheckout}
                disabled={cart.length === 0}
              >
                Go to Checkout →
              </button>
            </div>
          </div>
        </section>

        <div className={styles.shareSection}>
          <button className={styles.shareBtn}>Share</button>
        </div>
      </>
    </PageLayout>
  );
}
