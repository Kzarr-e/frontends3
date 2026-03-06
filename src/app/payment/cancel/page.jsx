"use client";

import { useSearchParams, useRouter } from "next/navigation";
import PageLayout from "../../components/PageLayout";

export default function PaymentCancelPage() {
  const params = useSearchParams();
  const router = useRouter();

  const orderId = params.get("order");

  return (

      <div style={styles.page}>
        <div style={styles.card}>
          <h1 style={styles.title}>Payment Cancelled</h1>

          <p style={styles.text}>
            Your payment was cancelled. No money was charged.
          </p>

          {orderId && (
            <p style={styles.order}>
              Order ID: <strong>{orderId}</strong>
            </p>
          )}

          <div style={styles.actions}>
            <button style={styles.retry} onClick={() => router.push(`/payment?order=${orderId}`)}>
              Try Again
            </button>

            <button style={styles.home} onClick={() => router.push("/home")}>
              Go to Home
            </button>
          </div>
        </div>
      </div>
 
  );
}

const styles = {
  page: {
    minHeight: "70vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  },
  card: {
    background: "#fff",
    padding: 40,
    borderRadius: 14,
    boxShadow: "0 20px 50px rgba(0,0,0,0.2)",
    textAlign: "center",
    maxWidth: 420,
    width: "100%"
  },
  title: {
    fontSize: 28,
    marginBottom: 10
  },
  text: {
    fontSize: 15,
    marginBottom: 20,
    opacity: 0.8
  },
  order: {
    marginBottom: 20
  },
  actions: {
    display: "flex",
    gap: 12,
    flexDirection: "column"
  },
  retry: {
    padding: "12px 18px",
    background: "#000",
    color: "#fff",
    borderRadius: 10,
    border: "none",
    cursor: "pointer"
  },
  home: {
    padding: "12px 18px",
    background: "#eee",
    color: "#000",
    borderRadius: 10,
    border: "none",
    cursor: "pointer"
  }
};
