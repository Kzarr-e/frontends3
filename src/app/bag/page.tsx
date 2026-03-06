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
}

export default function BagSection() {
  const router = useRouter();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  /* =========================
     FETCH CART
  ========================= */
  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const res = await fetch(`${API}/api/cart`, {
        credentials: "include",
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
  const updateQty = async (productId: string, qty: number) => {
    if (qty < 1) return;

    try {
      await fetch(`${API}/api/cart/update`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity: qty }),
      });

      fetchCart();
    } catch (err) {
      console.error("Update failed", err);
    }
  };

  /* =========================
     REMOVE ITEM
  ========================= */
  const removeItem = async (productId: string) => {
    try {
      await fetch(`${API}/api/cart/remove/${productId}`, {
        method: "DELETE",
        credentials: "include",
      });

      fetchCart();
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

          {cart.map((item) => (
            <div
              key={`${item.productId}-${item.size || "default"}`}
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
                  <span>Size: {item.size || "M"}</span>
                  <span>
                    Qty:
                    <input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) =>
                        updateQty(item.productId, Number(e.target.value))
                      }
                    />
                  </span>
                </div>
              </div>

              <button
                className={styles.deleteBtn}
                onClick={() => removeItem(item.productId)}
              >
                <FiTrash2 size={18} />
              </button>
            </div>
          ))}
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
