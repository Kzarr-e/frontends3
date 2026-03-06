"use client";

import { useSearchParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import styles from "./Payment.module.css";

export default function PaymentPage() {
  const [stripeActive, setStripeActive] = useState(false);
  const params = useSearchParams();
  const router = useRouter();
  const orderId = params.get("order");

  const [order, setOrder] = useState(null);
  const [loadingOrder, setLoadingOrder] = useState(true);
  const [popup, setPopup] = useState({ show: false, message: "", type: "" });

  function showPopup(message, type = "success") {
    setPopup({ show: true, message, type });
    setTimeout(() => setPopup({ show: false, message: "", type: "" }), 2600);
  }

  const [loadingStripe, setLoadingStripe] = useState(false);
  const [loadingCOD, setLoadingCOD] = useState(false);

  useEffect(() => {
    async function loadOrder() {
      if (!orderId) return;

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/checkout/order/${orderId}`
        );
        const data = await res.json();
        if (!data.success) showPopup("Order not found", "error");
        else setOrder(data.order);
      } catch (err) {
        showPopup("Failed to load order", "error");
      } finally {
        setLoadingOrder(false);
      }
    }
    loadOrder();
  }, [orderId]);

  async function placeCodOrder() {
    try {
      setLoadingCOD(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/checkout/cod`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId }),
        }
      );

      const data = await res.json();
      if (!data.success) {
        showPopup("COD failed", "error");
        return;
      }

      router.push(`/payment/success?order=${orderId}`);
    } finally {
      setLoadingCOD(false);
    }
  }

async function startStripePayment() {
  try {
    setStripeActive(true);
    setLoadingStripe(true);

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/checkout/stripe/pay`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      }
    );

    const data = await res.json();
    if (!data.success || !data.url) {
      showPopup("Stripe failed", "error");
      setStripeActive(false);
      return;
    }

    window.location.href = data.url;
  } finally {
    setLoadingStripe(false);
  }
}


  if (loadingOrder) return <div className={styles.loading}>Loading…</div>;
  if (!order) return <div className={styles.loading}>Order not found</div>;

return (
 <div
  className={`${styles.pageWrap} ${
    stripeActive ? styles.stripeActive : ""
  }`}
>
    <div className={styles.container}>
      <h2>Select Payment Method</h2>
     <div className={styles.paymentButtonsColumn}>
  {/* STRIPE */}
  <button
    className={`${styles.payButtonBase} ${styles.stripeBtn}`}
    onClick={startStripePayment}
    disabled={loadingStripe}
  >
    {loadingStripe ? "Processing…" : "Pay with Stripe"}
  </button>

  {/* COD */}
  <button
    className={`${styles.payButtonBase} ${styles.codBtn}`}
    onClick={placeCodOrder}
    disabled={loadingCOD}
  >
 
    {loadingCOD ? "Placing Order…" : "Cash On Delivery"}
  </button>
</div>

    </div>

    {popup.show && (
      <div className={styles.popupOverlay}>
        <div className={`${styles.popupBox} ${styles[popup.type]}`}>
          {popup.message}
        </div>
      </div>
    )}
  </div>
);

}
