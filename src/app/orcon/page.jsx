"use client";

import React from "react";
import Link from "next/link";
import { CheckCircle, Home, FileText, CreditCard } from "lucide-react";
import styles from "./OrderConfirmation.module.css";

export default function OrderConfirmationPage() {
  const orderDetails = {
    number: "#NB12345",
    date: "September 12, 2025",
    name: "Abhijeet Kulkarni",
    address: "123 MG Road, Pune, India",
    payment: "Razorpay – Credit Card",
    delivery: "Sep 16 – Sep 20, 2025",
  };

  const items = [
    { id: 1, name: "Elegant White Shirt", size: "L", qty: 1, price: 49.99 },
    { id: 2, name: "Elegant White Shirt", size: "L", qty: 1, price: 49.99 },
  ];

  const total = items.reduce((sum, item) => sum + item.price * item.qty, 0);

  return (
    <div className={styles.pageWrap}>
      {/* Progress bar */}
      <div className={styles.progress}>
        <div className={styles.progressInner}>
          <div className={styles.progressStepActive}><CheckCircle size={18} /></div>
          <div className={styles.progressLineActive}></div>
          <div className={styles.progressStepActive}><Home size={18} /></div>
          <div className={styles.progressLineActive}></div>
          <div className={styles.progressStepActive}><FileText size={18} /></div>
          <div className={styles.progressLineActive}></div>
          <div className={styles.progressStepActive}><CreditCard size={18} /></div>
        </div>
      </div>

      {/* Confirmation Card */}
      <div className={styles.confirmBox}>
        <div className={styles.iconWrap}>
          <CheckCircle className={styles.bigIcon} size={60} />
          <h2>Order Confirmed!</h2>
          <p>Thank you for shopping with <strong>KZARRĒ</strong></p>
        </div>

        {/* Order details */}
        <div className={styles.section}>
          <h3>Order Details</h3>
          <div className={styles.detailsGrid}>
            <span>Order Number:</span><span>{orderDetails.number}</span>
            <span>Order Date:</span><span>{orderDetails.date}</span>
            <span>Customer Name:</span><span>{orderDetails.name}</span>
            <span>Shipping Address:</span><span>{orderDetails.address}</span>
            <span>Payment Method:</span><span>{orderDetails.payment}</span>
            <span>Estimated Delivery:</span><span>{orderDetails.delivery}</span>
          </div>
        </div>

        {/* Items */}
        <div className={styles.section}>
          <h3>Items Ordered</h3>
          <div className={styles.itemsList}>
            {items.map((item) => (
              <div className={styles.itemBox} key={item.id}>
                <div>
                  <p className={styles.itemName}>{item.name}</p>
                  <p className={styles.itemMeta}>Size: {item.size} · Qty: {item.qty}</p>
                </div>
                <div className={styles.itemPrice}>${item.price.toFixed(2)}</div>
              </div>
            ))}
          </div>

          <div className={styles.totalRow}>
            <strong>Total:</strong>
            <strong>${total.toFixed(2)}</strong>
          </div>
          <p className={styles.note}>
            You’ll receive an email with your order details and a tracking link once it’s shipped.
          </p>
        </div>

        <Link href="/" className={styles.shopBtn}>
          Shop More →
        </Link>
      </div>
    </div>
  );
}
