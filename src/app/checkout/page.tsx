"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import styles from "./Checkout.module.css";
import { useSearchParams, useRouter } from "next/navigation";
import PageLayout from "../components/PageLayout";
const API = process.env.NEXT_PUBLIC_BACKEND_API_URL;

export default function CheckoutPage() {
  const search = useSearchParams();
  const router = useRouter();

  /* ================= MODE ================= */
  const productId = search.get("product"); // BUY NOW if exists
  const isBuyNow = Boolean(productId);

  const sizeFromUrl = search.get("size") || "";
  const colorFromUrl = search.get("color") || "";
  const qtyFromUrl = Number(search.get("qty") || 1);

  /* ================= STATE ================= */
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
  const [guestEmail, setGuestEmail] = useState("");
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("kzarre_token")
      : null;
  const isGuest = !token;
  /* ================= LOAD ITEMS ================= */
  useEffect(() => {
    async function loadItems() {
      try {
        if (isBuyNow) {
          // 🔥 BUY NOW
          const res = await fetch(`${API}/api/products/${productId}`);
          const data = await res.json();
          const p = data.product;

          setItems([
            {
              productId: p._id,
              name: p.name,
              image: p.imageUrl,
              price: p.price,
              quantity: qtyFromUrl,
              size: sizeFromUrl,
              color: colorFromUrl,
            },
          ]);
        } else {
          // 🔥 CART
          const res = await fetch(`${API}/api/cart`, {
            credentials: "include",
          });
          const data = await res.json();
          setItems(data.items || []);
        }
      } catch (err) {
        console.error("Load items failed", err);
      } finally {
        setLoading(false);
      }
    }

    loadItems();
  }, [isBuyNow, productId]);

  /* ================= LOAD ADDRESSES ================= */
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
  if (!items.length) return <div className={styles.loading}>No items</div>;

  /* ================= SAVE ADDRESS ================= */
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

  /* ================= PLACE ORDER ================= */
  async function handleNext() {

    let addr;

    if (isGuest) {

      if (!guestEmail) {
        return alert("Enter email");
      }

      if (!newAddress.name || !newAddress.phone || !newAddress.line1) {
        return alert("Enter address");
      }

      addr = newAddress;

    } else {

      addr = addresses.find((a) => a._id === selectedAddressId);
      if (!addr) return alert("Select address");

    }

    const endpoint = isGuest
      ? "/api/checkout/create-guest-order"
      : "/api/checkout/create-order";

    const body = isBuyNow
      ? {
        productId,
        qty: items[0].quantity,
        size: items[0].size,
        color: items[0].color,
        address: addr,
        email: guestEmail,
        items,
      }
      : {
        address: addr,
        email: guestEmail,
        items,
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

    router.push(`/payment?order=${data.orderId}`);
  }

  /* ================= TOTAL ================= */
  const total = items.reduce(
    (sum, i) => sum + i.price * i.quantity,
    0
  );

  /* ================= UI ================= */
  return (
    <PageLayout>
      <div className={styles.pageWrap}>
        <div className={styles.container}>
          {/* LEFT */}
          <div className={styles.left}>
            <h2>Select delivery address</h2>

            {!isGuest &&
              addresses.map((a) => (
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
            {isGuest && (
              <div className={styles.addForm}>
                <input
                  placeholder="Email"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                />

                <input
                  placeholder="Full Name"
                  value={newAddress.name}
                  onChange={(e) =>
                    setNewAddress({ ...newAddress, name: e.target.value })
                  }
                />

                <input
                  placeholder="Phone"
                  value={newAddress.phone}
                  onChange={(e) =>
                    setNewAddress({ ...newAddress, phone: e.target.value })
                  }
                />

                <input
                  placeholder="Address"
                  value={newAddress.line1}
                  onChange={(e) =>
                    setNewAddress({ ...newAddress, line1: e.target.value })
                  }
                />

                <input
                  placeholder="City"
                  value={newAddress.city}
                  onChange={(e) =>
                    setNewAddress({ ...newAddress, city: e.target.value })
                  }
                />

                <input
                  placeholder="State"
                  value={newAddress.state}
                  onChange={(e) =>
                    setNewAddress({ ...newAddress, state: e.target.value })
                  }
                />

                <input
                  placeholder="Pincode"
                  value={newAddress.pincode}
                  onChange={(e) =>
                    setNewAddress({ ...newAddress, pincode: e.target.value })
                  }
                />
              </div>
            )}
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

            {items.map((item) => (
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
    </PageLayout>
  );
}
