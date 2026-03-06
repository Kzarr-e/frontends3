"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import PageLayout from "../../components/PageLayout";

/* ================= ✅ USD FORMATTER ================= */
function formatUSD(amount = 0) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export default function SuccessPage() {
  const searchParams = useSearchParams();

  // ✅ SUPPORT BOTH ?orderId= & ?order=
  const orderId =
    searchParams.get("orderId") || searchParams.get("order");

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* ================= ✅ FETCH ORDER ================= */
  useEffect(() => {
    if (!orderId) {
      setError("Invalid Order ID");
      setLoading(false);
      return;
    }

    async function fetchOrder() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/orders/${orderId}`,
          { cache: "no-store" }
        );

        if (!res.ok) throw new Error("Order not found");

        const data = await res.json();
        setOrder(data.order || data); // ✅ Supports both API shapes
      } catch (err) {
        setError(err?.message || "Failed to load order");
      } finally {
        setLoading(false);
      }
    }

    fetchOrder();
  }, [orderId]);

  /* ================= ✅ LOADING ================= */
  if (loading) {
    return (
 
        <div style={styles.page}>
          <div style={styles.card}>Loading order details...</div>
        </div>

    );
  }

  /* ================= ✅ ERROR ================= */
  if (error || !order) {
    return (
 
        <div style={styles.page}>
          <div style={styles.card}>
            <h2>{error || "Order not found"}</h2>
            <a href="/home" style={styles.primaryBtn}>
              Back to Home
            </a>
          </div>
        </div>

    );
  }

  /* ================= ✅ SMART FIELD MAPPING ================= */

  const customerName =
    order.user?.name ||
    order.customer?.name ||
    order.address?.name ||
    "Guest";

  const customerEmail =
    order.user?.email ||
    order.customer?.email ||
    order.address?.email ||
    "Not Provided";

  // ✅ AUTO-CALCULATE SUBTOTAL FROM ITEMS
  const calculatedSubtotal = Array.isArray(order.items)
    ? order.items.reduce(
        (sum, item) => sum + (item.price ?? 0) * (item.qty ?? 1),
        0
      )
    : 0;

  const subtotal =
    order.subtotal ??
    order.subTotal ??
    order.totalAmount ??
    calculatedSubtotal;

  const shipping =
    order.shipping ??
    order.shippingCharges ??
    order.deliveryCharge ??
    0;

  // ✅ FINAL TOTAL
  const total =
    order.total ??
    order.grandTotal ??
    order.totalAmount ??
    subtotal + shipping;

  /* ================= ✅ FINAL UI ================= */
  return (
 
      <div style={styles.page}>
        <div style={styles.card}>
          {/* ✅ Header */}
          <div style={styles.header}>
            <h1 style={styles.title}>Order Confirmed</h1>
            <p style={styles.subtitle}>
              Thank you for shopping with <strong>KZARRE</strong>
            </p>
          </div>

          {/* ✅ Order Info */}
          <div style={styles.section}>
            <div style={styles.row}>
              <span>Order ID</span>
              <strong>{order._id || orderId}</strong>
            </div>
            <div style={styles.row}>
              <span>Order Date</span>
              <strong>
                {order.createdAt
                  ? new Date(order.createdAt).toLocaleDateString()
                  : new Date().toLocaleDateString()}
              </strong>
            </div>
            <div style={styles.row}>
              <span>Payment Method</span>
              <strong>{order.paymentMethod || "Cash on Delivery"}</strong>
            </div>
          </div>

          {/* ✅ Customer Info */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Billing Details</h3>
            <div style={styles.row}>
              <span>Name</span>
              <strong>{customerName}</strong>
            </div>
            <div style={styles.row}>
              <span>Email</span>
              <strong>{customerEmail}</strong>
            </div>
          </div>

          {/* ✅ Order Items */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Order Summary</h3>

            {Array.isArray(order.items) &&
              order.items.map((item, i) => (
                <div key={i} style={styles.itemRow}>
                  <span>
                    {item.product?.name || item.name} × {item.qty ?? 1}
                  </span>
                  <strong>{formatUSD(item.price ?? 0)}</strong>
                </div>
              ))}

            <hr style={styles.divider} />

            <div style={styles.totalRow}>
              <span>Subtotal</span>
              <strong>{formatUSD(subtotal)}</strong>
            </div>

            <div style={styles.totalRow}>
              <span>Shipping</span>
              <strong>{shipping === 0 ? "Free" : formatUSD(shipping)}</strong>
            </div>

            <div style={styles.grandTotal}>
              <span>Total</span>
              <strong>{formatUSD(total)}</strong>
            </div>
          </div>

          {/* ✅ Footer Actions */}
          <div style={styles.footer}>
            <a href="/home" style={styles.primaryBtn}>
              Continue Shopping →
            </a>

            <a href="/orders" style={styles.secondaryBtn}>
              View My Orders
            </a>
          </div>
        </div>
      </div>

  );
}

/* ============================
   ✅ STYLES
============================ */

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f0f0f0ff",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    fontFamily: "Inter, system-ui, sans-serif",
  },
  card: {
    background: "#fff",
    color: "#000",
    width: "100%",
    maxWidth: 520,
    borderRadius: 14,
    padding: 28,
    boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
  },
  header: { textAlign: "center", marginBottom: 24 },
  title: { fontSize: 28, fontWeight: 700, letterSpacing: 1 },
  subtitle: { fontSize: 14, opacity: 0.7 },
  section: { marginTop: 24, borderTop: "1px solid #eee", paddingTop: 16 },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 600,
    marginBottom: 10,
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: 14,
    marginBottom: 8,
  },
  itemRow: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: 14,
    marginBottom: 10,
  },
  divider: {
    margin: "16px 0",
    border: "none",
    borderTop: "1px dashed #ccc",
  },
  totalRow: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: 14,
    marginBottom: 6,
  },
  grandTotal: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: 18,
    fontWeight: 700,
    marginTop: 12,
  },
  footer: { marginTop: 30, display: "flex", flexDirection: "column", gap: 12 },
  primaryBtn: {
    background: "#000",
    color: "#fff",
    padding: "14px 20px",
    borderRadius: 8,
    textAlign: "center",
    textDecoration: "none",
    fontWeight: 600,
  },
  secondaryBtn: {
    border: "1px solid #000",
    color: "#000",
    padding: "14px 20px",
    borderRadius: 8,
    textAlign: "center",
    textDecoration: "none",
    fontWeight: 600,
  },
};
