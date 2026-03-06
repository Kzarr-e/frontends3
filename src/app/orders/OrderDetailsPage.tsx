"use client";

import React, { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { User, Package, Settings, ShoppingCart } from "lucide-react";
import styles from "./OrderDetails.module.css";
import PageLayout from "../components/PageLayout";
import SidebarNav from "../components/SidebarNav";

/* ============================
   ✅ TYPES (MUST BE AT TOP)
============================ */

interface OrderItem {
    image: string;
    name: string;
    sku: string;
    size: string;
    color: string;
    qty: number;
    price: number;
}

interface Address {
    name: string;
    phone: string;
    city: string;
    pincode: string;
}

interface Shipment {
    carrier?: "ups" | "fedex" | "dhl" | "manual";
    trackingId?: string;
    status?:
    | "label_created"
    | "picked_up"
    | "in_transit"
    | "out_for_delivery"
    | "delivered"
    | "exception";
    labelUrl?: string;
    shippedAt?: string;
    deliveredAt?: string;
}

interface OrderReturn {
    status:
    | "requested"
    | "approved"
    | "pickup_scheduled"
    | "picked"
    | "qc_passed"
    | "qc_failed"
    | "rejected"
    | "refunded";
    reason?: string;
    requestedAt?: string;
}


interface Order {
    orderId: string;
    createdAt: string;

    status:
    | "pending"
    | "paid"
    | "shipped"
    | "delivered"
    | "cancelled"
    | "failed"
    | "refunded";

    paymentMethod: "ONLINE" | "COD";
    amount: number;

    items: OrderItem[];
    address?: Address;

    shipment?: Shipment;

    // ✅ ADD THIS
    return?: OrderReturn;
}



/* ============================
   ✅ COMPONENT
============================ */

export default function OrderDetailsPage() {

    const pathname = usePathname();

    const orderId = useMemo(() => {
        if (!pathname) return null;
        const parts = pathname.replace(/\/$/, "").split("/");
        return parts[parts.length - 1];
    }, [pathname]);


    const [order, setOrder] = useState<Order | null>(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [actionLoading, setActionLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState("");

    const API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;
    /* =======================
       ✅ FETCH SINGLE ORDER
    ======================= */
    useEffect(() => {
        if (!orderId) return;

        async function fetchOrder() {
            try {
                const res = await fetch(`${API_URL}/api/orders/${orderId}`, {
                    credentials: "include",
                });

                const data = await res.json();
                if (!res.ok) throw new Error(data.message || "Failed to fetch order");

                setOrder(data.order);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Something went wrong");
            } finally {
                setLoading(false);
            }
        }

        fetchOrder();
    }, [orderId, API_URL]);

    /* =======================
       ✅ RELOAD ORDER
    ======================= */
    async function reloadOrder() {
        if (!orderId) return;
        try {
            const res = await fetch(`${API_URL}/api/orders/${orderId}`, {
                credentials: "include",
            });
            const data = await res.json();
            if (res.ok) setOrder(data.order);
        } catch (e) {
            console.error("reload error:", e);
        }
    }
    /* =======================
       ✅ CANCEL / REFUND
    ======================= */
    const handleCancelOrder = async () => {
        if (!order || !orderId) return;

        const isPaidOnline =
            order.status === "paid" && order.paymentMethod === "ONLINE";

        const confirmMsg = isPaidOnline
            ? "This order is already paid. Cancelling will trigger a refund. Continue?"
            : "Are you sure you want to cancel this order?";

        if (!window.confirm(confirmMsg)) return;

        try {
            setActionLoading(true);
            setSuccessMsg("");

            const endpoint = isPaidOnline
                ? `${API_URL}/api/checkout/refund`
                : `${API_URL}/api/orders/cancel/${order.orderId}`;

            const res = await fetch(endpoint, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ orderId: order.orderId }),
            });

            const data = await res.json();
            if (!res.ok || !data.success)
                throw new Error(data.message || "Failed");

            if (data.order) setOrder(data.order);
            else await reloadOrder();

            setSuccessMsg(
                isPaidOnline
                    ? "✅ Order refunded successfully"
                    : "✅ Order cancelled successfully"
            );
        } catch (err) {
            alert(err instanceof Error ? err.message : "Cancel failed");
        } finally {
            setActionLoading(false);
        }
    };

    /* =======================
       ✅ RETURN (REFUND AFTER DELIVERY)
    ======================= */

    const handleReturnOrder = async () => {
        if (!order) return;

        if (!window.confirm("Submit return request for this order?")) return;

        try {
            setActionLoading(true);
            setSuccessMsg("");

            const res = await fetch(`${API_URL}/api/orders/return`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    orderId: order.orderId,
                    reason: "Customer requested return",
                }),
            });

            const data = await res.json();
            if (!res.ok || !data.success)
                throw new Error(data.message || "Return request failed");

            setOrder(data.order);
            setSuccessMsg("✅ Return request submitted successfully");
        } catch (err) {
            alert(err instanceof Error ? err.message : "Return failed");
        } finally {
            setActionLoading(false);
        }
    };


    /* =======================
       ✅ UI STATES
    ======================= */

    if (loading)
        return (

            <p className={styles.loading}>Loading order...</p>

        );

    if (error)
        return (

            <p className={styles.error}>{error}</p>

        );

    if (!order) return null;

    const isCancellableStatus = ["pending", "paid", "shipped"].includes(
        order.status
    );

    /* =======================
       ✅ UI RENDER
    ======================= */

    return (
        <PageLayout>
            <div className={styles.pageWrap}>
                <div className={styles.container}>
                    {/* ===== SIDEBAR ===== */}
                    <SidebarNav />
                    {/* ===== MAIN CONTENT ===== */}
                    <main className={styles.content}>
                        <h2 className={styles.sectionTitle}>Order Details</h2>

                        <div className={styles.detailsCard}>
                            {/* ✅ TOP INFO */}
                            <div className={styles.topRow}>
                                <div>
                                    <strong>Order ID</strong>
                                    <p>{order.orderId}</p>
                                </div>
                                <div>
                                    <strong>Order Placed</strong>
                                    <p>{new Date(order.createdAt).toDateString()}</p>
                                </div>
                                <div>
                                    <strong>No of items</strong>
                                    <p>{order.items.length} items</p>
                                </div>
                                <div>
                                    <strong>Status</strong>
                                    <p>
                                        {order.status?.charAt(0).toUpperCase() +
                                            order.status?.slice(1)}
                                    </p>
                                </div>
                            </div>

                            {/* ✅ ACTION BUTTONS */}
                            {successMsg && (
                                <p
                                    style={{
                                        color: "green",
                                        fontWeight: 600,
                                        marginBottom: "10px",
                                    }}
                                >
                                    {successMsg}
                                </p>
                            )}

                            <div style={{ marginBottom: "20px" }}>

                                {!order.return?.status && (
                                    <button
                                        onClick={handleReturnOrder}
                                        disabled={actionLoading}
                                        style={{
                                            padding: "10px 18px",
                                            background: "#000",
                                            color: "#fff",
                                            border: "none",
                                            borderRadius: "6px",
                                            cursor: "pointer",
                                            opacity: actionLoading ? 0.6 : 1,
                                        }}
                                    >
                                        {actionLoading ? "Processing..." : "Return Order"}
                                    </button>
                                )}


                                {order.return?.status && (
                                    <div
                                        style={{
                                            marginTop: "10px",
                                            padding: "12px",
                                            borderRadius: "6px",
                                            background: "#f9f9f9",
                                            border: "1px solid #ddd",
                                        }}
                                    >
                                        <p style={{ fontWeight: 600 }}>
                                            Return Status:{" "}
                                            <span style={{ color: "#d9c169" }}>
                                                {order.return.status.replaceAll("_", " ").toUpperCase()}
                                            </span>
                                        </p>

                                        {order.return.reason && (
                                            <p style={{ marginTop: "6px", fontSize: "14px" }}>
                                                <strong>Reason:</strong> {order.return.reason}
                                            </p>
                                        )}

                                        {order.return.status === "requested" && (
                                            <p style={{ marginTop: "6px", fontSize: "13px", color: "#555" }}>
                                                Your return request has been sent to the seller for approval.
                                            </p>
                                        )}

                                        {order.return.status === "approved" && (
                                            <p style={{ marginTop: "6px", color: "green" }}>
                                                Your return has been approved. Pickup will be scheduled.
                                            </p>
                                        )}

                                        {order.return.status === "rejected" && (
                                            <p style={{ marginTop: "6px", color: "red" }}>
                                                Your return request was rejected.
                                            </p>
                                        )}
                                    </div>
                                )}


                            </div>

                            {/* ✅ TRACKING HEADER */}
                            <div className={styles.trackingHeader}>
                                <h3>Order Tracking</h3>

                                {order.shipment?.trackingId ? (
                                    <>
                                        <p>
                                            Tracking ID: <strong>{order.shipment.trackingId}</strong>
                                        </p>
                                        <p>
                                            Carrier:{" "}
                                            <strong>
                                                {order.shipment.carrier?.toUpperCase()}
                                            </strong>
                                        </p>

                                        {order.shipment.labelUrl && (
                                            <a
                                                href={order.shipment.labelUrl}
                                                className={styles.downloadLabel}
                                            >
                                                Download Shipping Label
                                            </a>
                                        )}
                                    </>
                                ) : (
                                    <p>Tracking ID: Not assigned yet</p>
                                )}
                            </div>

                            {order.shipment?.status && (
                                <p
                                    style={{
                                        marginTop: "6px",
                                        fontWeight: 600,
                                        color:
                                            order.shipment.status === "delivered"
                                                ? "green"
                                                : order.shipment.status === "exception"
                                                    ? "red"
                                                    : "#000",
                                    }}
                                >
                                    Shipment Status:{" "}
                                    {order.shipment.status.replaceAll("_", " ").toUpperCase()}
                                </p>
                            )}

                            {order.status === "cancelled" && (
                                <p
                                    style={{
                                        color: "red",
                                        fontWeight: 600,
                                        marginBottom: "10px",
                                    }}
                                >
                                    This order has been cancelled
                                </p>
                            )}

                            {order.status === "failed" && (
                                <p
                                    style={{
                                        color: "red",
                                        fontWeight: 600,
                                        marginBottom: "10px",
                                    }}
                                >
                                    Payment failed / cancelled. No charge was made.
                                </p>
                            )}

                            {order.status === "refunded" && (
                                <p
                                    style={{
                                        color: "#d9c169",
                                        fontWeight: 600,
                                        marginBottom: "10px",
                                    }}
                                >
                                    This order has been refunded.
                                </p>
                            )}

                            {/* ✅ ORDER TRACKING STEPS */}
                            <div className={styles.trackingBox}>
                                {[
                                    {
                                        key: "pending",
                                        label: "Order Placed",
                                        icon: "/Asset/gifs/order-placed.gif",
                                    },
                                    {
                                        key: "paid",
                                        label: "Order Packed",
                                        icon: "/Asset/gifs/package.gif",
                                    },
                                    {
                                        key: "shipped",
                                        label: "In Transit",
                                        icon: "/Asset/gifs/truck.gif",
                                    },
                                    {
                                        key: "delivered",
                                        label: "Delivered",
                                        icon: "/Asset/gifs/delivered.gif",
                                    },
                                ].map((step, idx, steps) => {
                                    const currentIndex = steps.findIndex(
                                        (s) => s.key === order.status
                                    );

                                    const isCompleted =
                                        currentIndex === -1 ? false : idx <= currentIndex;
                                    const isCurrent = currentIndex === idx;

                                    return (
                                        <div key={idx} className={styles.trackStep}>
                                            <div className={styles.icon}>
                                                <Image
                                                    src={step.icon}
                                                    alt={step.label}
                                                    width={55}
                                                    height={55}
                                                    unoptimized
                                                    style={{
                                                        opacity: isCompleted ? 1 : 0.3,
                                                        filter: isCompleted ? "none" : "grayscale(100%)",
                                                    }}
                                                />
                                            </div>

                                            <p
                                                className={styles.label}
                                                style={{
                                                    fontWeight: isCurrent ? 700 : 500,
                                                    color: isCompleted ? "#000" : "#aaa",
                                                }}
                                            >
                                                {step.label}
                                            </p>

                                            {isCurrent && (
                                                <p
                                                    className={styles.date}
                                                    style={{ color: "#d9c169" }}
                                                >
                                                    Current Status
                                                </p>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* ✅ ITEMS */}
                            <div className={styles.itemsBox}>
                                <h3>Items from the order</h3>

                                <div className={styles.itemsHeader}>
                                    <span>Product</span>
                                    <span>Quantity</span>
                                    <span>Total Price</span>
                                </div>

                                {order.items.map((item, index) => (
                                    <div key={index} className={styles.itemRow}>
                                        <div className={styles.itemInfo}>
                                            <Image
                                                src={item.image}
                                                alt={item.name}
                                                width={100}
                                                height={100}
                                                className={styles.imgs}
                                                unoptimized
                                            />
                                            <div>
                                                <h4>{item.name}</h4>
                                                <p>SKU: {item.sku}</p>
                                                <p>
                                                    Size: {item.size} | Colour:{" "}
                                                    <strong>{item.color}</strong>
                                                </p>
                                                <p className={styles.expected}>
                                                    Payment Method:{" "}
                                                    <strong>{order.paymentMethod}</strong>
                                                </p>
                                            </div>
                                        </div>

                                        <div className={styles.qty}>{item.qty}</div>

                                        <div className={styles.price}>
                                            ${Number(item.price * item.qty).toFixed(2)}
                                            <span>including Tax</span>
                                        </div>
                                    </div>
                                ))}

                                {/* ✅ TOTAL */}
                                <div className={styles.totalBox}>
                                    <strong>Total Amount:</strong>{" "}
                                    ${Number(order.amount).toFixed(2)}
                                </div>

                                {/* ✅ SHIPPING ADDRESS */}
                                <div className={styles.addressBox}>
                                    <h4>Shipping Address</h4>
                                    <p>{order.address?.name}</p>
                                    <p>{order.address?.phone}</p>
                                    <p>
                                        {order.address?.city} - {order.address?.pincode}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </PageLayout>
    );
}