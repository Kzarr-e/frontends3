"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import styles from "./Checkout.module.css";
import { useRouter } from "next/navigation";

const API = process.env.NEXT_PUBLIC_BACKEND_API_URL;

interface CartItem {
  productId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  size?: string;
}

export default function CartCheckoutPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);

  /* ================= ADDRESS ================= */
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const [newAddress, setNewAddress] = useState({
    title: "",
    name: "",
    line1: "",
    city: "",
    state: "",
    pincode: "",
    phone: "",
  });

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("kzarre_token")
      : null;

  const isGuest = !token;
  /* =========================
     LOAD CART (🔥 IMPORTANT)
  ========================= */
  useEffect(() => {
    async function loadCart() {
      try {
        if (isGuest) {
          // 🔥 LOCAL STORAGE CART
          const localCart = JSON.parse(localStorage.getItem("cart") || "[]");
          setCart(localCart);
        } else {
          // 🔥 USER CART (DB)
          const res = await fetch(`${API}/api/cart`, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });

          const data = await res.json();
          setCart(data.items || []);
        }
      } finally {
        setLoading(false);
      }
    }

    loadCart();
  }, []);

  /* =========================
     LOAD ADDRESSES
  ========================= */
  useEffect(() => {
    if (!token) return;

    fetch(`${API}/api/user/address/list`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setAddresses(d.addresses || []);
          if (d.addresses.length) {
            setSelectedAddressId(d.addresses[0]._id);
          }
        }
      });
  }, [token]);

  if (loading) return <div className={styles.loading}>Loading…</div>;
  if (cart.length === 0)
    return <div className={styles.loading}>Your cart is empty</div>;

  /* =========================
     SAVE NEW ADDRESS
  ========================= */
  async function saveNewAddress() {
    const res = await fetch(`${API}/api/user/address/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(newAddress),
    });

    const data = await res.json();
    if (data.success) {
      setAddresses((a) => [...a, data.address]);
      setSelectedAddressId(data.address._id);
      setShowAddForm(false);
    }
  }

  /* =========================
     CREATE ORDER → PAYMENT
  ========================= */
  async function handleNext() {
    const addr = addresses.find((a) => a._id === selectedAddressId);
    if (!addr) {
      alert("Please select an address");
      return;
    }

    const endpoint = isGuest
      ? "/api/checkout/create-guest-order"
      : "/api/checkout/create-from-cart";

    const body = isGuest
      ? {
        address: newAddress,
        items: cart,
      }
      : {
        address: addr,
      };

    const headers: any = {
      "Content-Type": "application/json",
    };

    if (!isGuest && token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const res = await fetch(`${API}${endpoint}`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!data.success) {
      alert(data.message || "Order failed");
      return;
    }
    // 🔥 CLEAR GUEST CART HERE
    if (isGuest) {
      localStorage.removeItem("cart");
    }
    router.push(`/payment?order=${data.orderId}`);
  }

  /* =========================
     TOTAL
  ========================= */
  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  /* =========================
     UI
  ========================= */
  return (
    <div className={styles.pageWrap}>
      <div className={styles.container}>
        {/* LEFT */}
        <div className={styles.left}>
          <h2>Select delivery address</h2>

          {addresses.map((a) => (
            <div
              key={a._id}
              className={`${styles.addressCard} ${selectedAddressId === a._id ? styles.addressCardSelected : ""
                }`}
              onClick={() => setSelectedAddressId(a._id)}
            >
              <strong>{a.title}</strong>
              <div>{a.name}</div>
              <div>{a.line1}</div>
              <div>{a.phone}</div>
            </div>
          ))}

          {showAddForm && (
            <div className={styles.addForm}>
              {Object.keys(newAddress).map((k) => (
                <input
                  key={k}
                  placeholder={k}
                  value={(newAddress as any)[k]}
                  onChange={(e) =>
                    setNewAddress({ ...newAddress, [k]: e.target.value })
                  }
                />
              ))}
              <button onClick={saveNewAddress}>Save</button>
            </div>
          )}

          <button className={styles.nextBtn} onClick={handleNext}>
            Place Order →
          </button>
        </div>

        {/* RIGHT */}
        <aside className={styles.right}>
          <h3>Order Summary</h3>

          {cart.map((item) => (
            <div key={item.productId} className={styles.summaryItem}>
              <Image src={item.image} alt="" width={80} height={80} />
              <div>
                <div className={styles.itemTitle}>{item.name}</div>
                <div>Qty: {item.quantity}</div>
                {item.size && <div>Size: {item.size}</div>}
                <div>${item.price}</div>
              </div>
            </div>
          ))}

          <div className={styles.grandTotal}>
            <strong>Total</strong>
            <strong>${total}</strong>
          </div>
        </aside>
      </div>
    </div>
  );
}
