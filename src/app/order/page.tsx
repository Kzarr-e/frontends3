"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { User, Package, Settings, ShoppingCart } from "lucide-react";
import styles from "./Orders.module.css";
import PageLayout from "../components/PageLayout";
import SidebarNav from "../components/SidebarNav";


// ================= TYPES =================
interface OrderItem {
  image?: string;
  name?: string;
  color?: string;
  size?: string;
}

interface Order {
  _id: string;
  orderId: string;
  status: string;
  createdAt: string;
  amount: number;
  items?: OrderItem[];
}

// ================= STATUS NORMALIZER =================
function normalizeStatus(status?: string): string {
  if (!status) return "";

  const map: Record<string, string> = {
    Processing: "In Progress",
    Shipped: "Shipped",
    Completed: "Delivered",
    Delivered: "Delivered",
    Cancelled: "Cancelled",
    Canceled: "Cancelled",
  };

  return map[status] || status;
}

export default function OrdersPage() {
  const [activeFilter, setActiveFilter] = useState<string>("All");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  // ================= FETCH ORDERS =================
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;

        const res = await fetch(`${API_URL}/api/orders`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data = await res.json();

        if (!res.ok) throw new Error(data.message || "Failed to fetch orders");

        setOrders(data.orders || data);
      } catch (err: unknown) {
        if (err instanceof Error) setError(err.message);
        else setError("Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // ================= FILTER LOGIC =================
  const filteredOrders =
    activeFilter === "All"
      ? orders
      : orders.filter((order) => {
        const status = order.status?.toLowerCase();

        // ✅ IN PROGRESS = pending + paid + shipped
        if (activeFilter === "In Conform") {
          return ["Conform", "paid", "shipped"].includes(status);
        }

        // ✅ DELIVERED
        if (activeFilter === "Delivered") {
          return status === "delivered";
        }

        // ✅ CANCELLED
        if (activeFilter === "Cancelled") {
          return status === "cancelled" || status === "failed";
        }

        return true;
      });


  return (

<PageLayout>
    <div className={styles.pageWrap}>

      <div className={styles.container}>
        {/* ================= SIDEBAR ================= */}
        <SidebarNav />
        {/* ================= MAIN CONTENT ================= */}
        <main className={styles.content}>
          <h2 className={styles.sectionTitle}>Orders</h2>

          {/* ================= FILTERS (ALWAYS VISIBLE) ================= */}
          <div className={styles.filterRow}>
            {["All", "In Progress", "Shipped", "Delivered", "Cancelled"].map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`${styles.filterBtn} ${activeFilter === f ? styles.activeFilter : ""
                  }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* ================= STATES ================= */}
          {loading && <p>Loading orders...</p>}
          {error && <p className={styles.error}>{error}</p>}

          {!loading && filteredOrders.length === 0 && (
            <div className={styles.emptyBox}>
              <p className={styles.emptyTitle}>No orders found</p>
              <p className={styles.emptyText}>Try changing the filter.</p>
            </div>
          )}

          {/* ================= ORDERS LIST ================= */}
          <div className={styles.ordersList}>
            {filteredOrders.map((order) => {
              const firstItem = order.items?.[0];

              return (
                <Link
                  key={order._id}
                  href={`/orders/${order.orderId}`}
                  className={styles.orderCard}
                >
                  <div className={styles.statusRow}>
                    <span
                      className={`${styles.statusTag} ${styles[
                        normalizeStatus(order.status)?.replace(/\s/g, "")
                      ]
                        }`}
                    >
                      {normalizeStatus(order.status)}
                    </span>


                    <span className={styles.date}>
                      {new Date(order.createdAt).toDateString()}
                    </span>
                  </div>

                  <div className={styles.orderContent}>
                    <div className={styles.imageWrap}>
                      <Image
                        src={
                          firstItem?.image ||
                          "https://via.placeholder.com/100"
                        }
                        alt={firstItem?.name || "Product"}
                        width={80}
                        height={80}
                        className={styles.imgs}
                        unoptimized
                      />
                    </div>

                    <div className={styles.orderInfo}>
                      <p className={styles.orderId}>
                        Order ID: <span>{order.orderId}</span>
                      </p>

                      <h4 className={styles.title}>{firstItem?.name}</h4>

                      <p className={styles.desc}>
                        Colour: {firstItem?.color} | Size: {firstItem?.size}
                      </p>

                      <p className={styles.price}>${order.amount}</p>
                    </div>
                  </div>

                  <div className={styles.arrow}>›</div>
                </Link>
              );
            })}
          </div>
        </main>
      </div>
    </div>
</PageLayout>
  );
}
