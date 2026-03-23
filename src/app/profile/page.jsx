"use client";

import React, { useEffect, useState } from "react";
import { Edit, Trash2, X, MapPin } from "lucide-react";
import "./luxury-loader.css"
import styles from "./Profile.module.css";
import PageLayout from "../components/PageLayout";
import SidebarNav from "../components/SidebarNav";
import { useAuth } from "../hooks/useAuth";
const API = process.env.NEXT_PUBLIC_BACKEND_API_URL;

/* ================================
   Helpers
================================ */
function stripNumber(s = "") {
  return s.replace(/[^\d]/g, "");
}

function combineDial(dial, number) {
  const n = stripNumber(number);
  const d = dial.replace(/\D/g, "");
  if (n.startsWith(d)) return `+${n}`;
  return `+${d}${n}`;
}
function formatPhone(phone = "") {
  const p = phone.replace(/\D/g, "");

  // US number without country code (10 digits)
  if (p.length === 10) {
    return `+1 (${p.slice(0, 3)}) ${p.slice(3, 6)}-${p.slice(6)}`;
  }

  // US number with country code (11 digits starting with 1)
  if (p.length === 11 && p.startsWith("1")) {
    return `+1 (${p.slice(1, 4)}) ${p.slice(4, 7)}-${p.slice(7)}`;
  }

  return phone; // fallback
}

const COUNTRIES = [
  { name: "United States", iso: "US", dial_code: "+1", min: 10, max: 11 },
];

/* ================================
   Toast Component
================================ */
function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => onClose(), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  if (!toast) return null;

  return (
    <div className={`${styles.toast} ${toast.type === "success" ? styles.toastSuccess : styles.toastError}`}>
      {toast.message}
      <button className={styles.toastClose} onClick={onClose}>×</button>
    </div>
  );
}

/* ================================
   MAIN PAGE COMPONENT
================================ */
export default function ProfilePage() {
  const { token } = useAuth(true);
  const zipTimeoutRef = React.useRef(null);
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState(null);
  const [errors, setErrors] = useState({});
  const [shake, setShake] = useState(false);
  const [editing, setEditing] = useState(false);
  const [toast, setToast] = useState(null);
  const fetchZipDetails = async (zip) => {
    try {
      if (zip.length !== 5) return;

      const res = await fetch(`https://api.zippopotam.us/us/${zip}`);
      if (!res.ok) return;

      const data = await res.json();
      const place = data.places[0];

      setAddressForm((prev) => ({
        ...prev,
        city: place["place name"],
        state: place["state"],
      }));
    } catch (err) {
      console.log("ZIP lookup failed", err);
    }
  };

  const handleZipChange = (zip) => {
    setAddressForm((prev) => ({ ...prev, zip }));

    clearTimeout(zipTimeoutRef.current);

    zipTimeoutRef.current = setTimeout(() => {
      fetchZipDetails(zip);
    }, 500);
  };

  const handlePhoneChange = (value) => {
    let phone = value.replace(/\D/g, "");

    if (phone.startsWith("1") && phone.length > 10) {
      phone = phone.slice(1);
    }

    setAddressForm((prev) => ({
      ...prev,
      phone,
      dial_code: "+1",
    }));
  };

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    countryIso: "USA",
    dial_code: "+1",
  });

  const [addresses, setAddresses] = useState([]);

  // modal
  const [showModal, setShowModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(false);
  const [addressForm, setAddressForm] = useState({
    title: "",
    name: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    zip: "",
    country: "US",
    phone: "",
    dial_code: "+1",

  });

  useEffect(() => setMounted(true), []);

  /* ================================
     Load Profile + Addresses
  ================================= */
  useEffect(() => {
    if (!mounted) return;

    async function load() {
      const token = localStorage.getItem("kzarre_token");
      if (!token) return (window.location.href = "/login");

      // Load profile
      const res = await fetch(`${API}/api/user/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (!data.success) return (window.location.href = "/login");

      setUser(data.user);
      setForm({
        name: data.user.name,
        email: data.user.email,
        phone: data.user.phone || "",
        countryIso: "IN",
        dial_code: "+91",
      });

      // Load addresses
      loadAddresses(token);
    }

    async function loadAddresses(token) {
      const r = await fetch(`${API}/api/user/address/list`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const d = await r.json();
      if (d.success) setAddresses(d.addresses);
    }

    load();
  }, [mounted]);

  if (!mounted) return null;
  if (!user) return <div className="luxury-loader">
    <div className="loader-logo">
      <h1 className="brand-name">KZARRĒ</h1>
    </div>
    <div className="loader-ring">
      <div className="ring"></div>
    </div>
  </div>;

  /* ================================
     Save Profile
  ================================= */
  async function saveProfile() {
    const country = COUNTRIES[0];

    const body = {
      name: form.name,
      email: form.email,
      phone: combineDial("+1", form.phone).replace(/^(\+1)+/, "+1"),
    };

    const res = await fetch(`${API}/api/user/profile`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!data.success) {
      return setToast({ type: "error", message: data.message });
    }

    setToast({ type: "success", message: "Profile updated" });
    setUser(data.user);
    setEditing(false);
  }

  /* ================================
     Address CRUD Logic
  ================================= */

  function openAddAddress() {
    setEditingAddress(false);

    setAddressForm({
      title: "",
      name: user?.name || "",
      line1: "",
      line2: "",
      city: "",
      state: "",
      zip: "",
      phone: "",
      dial_code: "+1",
      country: "US",
    });

    setShowModal(true);
  }

  function openEditAddress(addr) {
    setEditingAddress(true);

    setAddressForm({
      ...addr,
      zip: addr.zip || addr.pincode || "",
      line2: addr.line2 || "",
      name: addr.name || user?.name || ""
    });

    setShowModal(true);
  }

  async function saveNewAddress() {
    const newErrors = {};

    if (!addressForm.title) newErrors.title = true;
    if (!addressForm.name) newErrors.name = true;
    if (!addressForm.phone) newErrors.phone = true;
    if (!addressForm.line1) newErrors.line1 = true;
    if (!addressForm.city) newErrors.city = true;
    if (!addressForm.state) newErrors.state = true;
    if (!addressForm.zip) newErrors.zip = true;

    if (addressForm.zip && !/^\d{5}$/.test(addressForm.zip)) {
      newErrors.zip = true;
    }

    if (addressForm.phone && addressForm.phone.length < 10) {
      newErrors.phone = true;
    }

    // ❌ if any error → show red + shake
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);

      setShake(true);
      setTimeout(() => setShake(false), 400); // reset animation

      return setToast({ type: "error", message: "Please fill all required fields correctly" });
    }

    // ✅ clear errors if valid
    setErrors({});

    try {
      const res = await fetch(`${API}/api/user/address/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify({
          ...addressForm,

          zip: addressForm.zip,
          line2: addressForm.line2 || "",

          phone: combineDial("+1", addressForm.phone),
        }),
      });

      const data = await res.json();

      if (!data.success) {
        return setToast({ type: "error", message: data.message });
      }

      setAddresses([data.address, ...addresses]);
      setToast({ type: "success", message: "Address added successfully" });
      setShowModal(false);
    } catch (err) {
      console.error("ADD ADDRESS ERROR:", err);
      setToast({ type: "error", message: "Something went wrong" });
    }
  }

  async function updateAddress() {
    const newErrors = {};

    if (!addressForm.title) newErrors.title = true;
    if (!addressForm.name) newErrors.name = true;
    if (!addressForm.phone) newErrors.phone = true;
    if (!addressForm.line1) newErrors.line1 = true;
    if (!addressForm.city) newErrors.city = true;
    if (!addressForm.state) newErrors.state = true;
    if (!addressForm.zip) newErrors.zip = true;

    if (addressForm.zip && !/^\d{5}$/.test(addressForm.zip)) {
      newErrors.zip = true;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);

      setShake(true);
      setTimeout(() => setShake(false), 400);

      return setToast({ type: "error", message: "Please fix highlighted fields" });
    }

    setErrors({});

    try {
      const res = await fetch(
        `${API}/api/user/address/update/${addressForm._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            ...addressForm,

            zip: addressForm.zip,
            line2: addressForm.line2 || "",

            phone: combineDial("+1", addressForm.phone),
          })
        }
      );

      const data = await res.json();

      if (!data.success) {
        return setToast({ type: "error", message: data.message });
      }

      setAddresses(
        addresses.map((a) =>
          a._id === addressForm._id ? data.address : a
        )
      );

      setToast({ type: "success", message: "Address updated successfully" });
      setShowModal(false);
    } catch (err) {
      console.error("UPDATE ADDRESS ERROR:", err);
      setToast({ type: "error", message: "Something went wrong" });
    }
  }

  async function deleteAddress(id) {
    if (!confirm("Delete this address?")) return;

    const res = await fetch(`${API}/api/user/address/delete/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    if (!data.success) return setToast({ type: "error", message: data.message });

    setAddresses(addresses.filter((a) => a._id !== id));
    setToast({ type: "success", message: "Address deleted" });
  }

  /* ================================
     RENDER PAGE
  ================================= */

  return (
    <PageLayout>
      <div className={styles.pageWrap}>
        <Toast toast={toast} onClose={() => setToast(null)} />

        <div className={styles.container}>
          <SidebarNav active="profile" />

          <main className={styles.content}>
            <h2 className={styles.sectionTitle}>My Profile</h2>

            {/* ================= PROFILE CARD ================= */}
            <div className={styles.card}>
              <div className={styles.cardRow}>
                <span className={styles.label}>
                  Name <Edit size={14} className={styles.editIcon} onClick={() => setEditing(true)} />
                </span>

                {!editing ? (
                  <span className={styles.value}>{user.name}</span>
                ) : (
                  <input
                    className={styles.input}
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                )}
              </div>

              <div className={styles.cardRow}>
                <span className={styles.label}>
                  Email <Edit size={14} className={styles.editIcon} onClick={() => setEditing(true)} />
                </span>

                {!editing ? (
                  <span className={styles.value}>{user.email}</span>
                ) : (
                  <input
                    className={styles.input}
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                )}
              </div>

              <div className={styles.cardRow}>
                <span className={styles.label}>
                  Phone <Edit size={14} className={styles.editIcon} onClick={() => setEditing(true)} />
                </span>

                {!editing ? (
                  <span className={styles.value}>
                    {user.phone ? formatPhone(user.phone) : "Not added"}
                  </span>
                ) : (
                  <input
                    className={styles.input}
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                )}
              </div>

              {editing && (
                <div className={styles.editActions}>
                  <button className={styles.saveBtn} onClick={saveProfile}>Save</button>
                  <button className={styles.cancelBtn} onClick={() => setEditing(false)}>Cancel</button>
                </div>
              )}
            </div>

            {/* ================= ADDRESS LIST ================= */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <span className={styles.label}>Saved Addresses</span>
                <button className={styles.addBtn} onClick={openAddAddress}>Add</button>
              </div>

              {addresses.map((addr) => (
                <div key={addr._id} className={styles.addressItem}>
                  <div className={styles.addrIcon}><MapPin size={18} /></div>

                  <div className={styles.addrText}>
                    <strong>{addr.title} {addr.name}</strong>
                    <p>
                      {addr.line1}
                      {addr.line2 && `, ${addr.line2}`}
                    </p>
                    <p>{addr.city}, {addr.state}</p>
                    <p>ZIP: {addr.zip || addr.pincode}</p>
                    <p>Phone: {formatPhone(addr.phone)}</p>
                  </div>

                  <div className={styles.addrActions}>
                    <button className={styles.addrEdit} onClick={() => openEditAddress(addr)}>
                      <Edit size={16} />
                    </button>

                    <button className={styles.addrDelete} onClick={() => deleteAddress(addr._id)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </main>
        </div>

        {/* ================= ADDRESS MODAL ================= */}
        {showModal && (
          <div className={styles.modalOverlay}>
            <div className={`${styles.modal} ${shake ? styles.shake : ""}`}>
              <div className={styles.modalHeader}>
                <h3>{editingAddress ? "Edit Address" : "Add Address"}</h3>
                <button className={styles.modalClose} onClick={() => setShowModal(false)}>
                  <X size={18} />
                </button>
              </div>

              <div className={styles.modalBody}>
                <label>
                  Title *
                  <select
                    value={addressForm.title}
                    onChange={(e) =>
                      setAddressForm({ ...addressForm, title: e.target.value })
                    }
                    className={errors.title ? styles.errorInput : ""}
                    required
                  >
                    <option value="">Select</option>
                    <option value="Mr">Mr</option>
                    <option value="Mrs">Mrs</option>
                    <option value="Miss">Miss</option>
                    <option value="Ms">Ms</option>
                  </select>
                </label>
                <label>
                  Full Name *
                  <input
                    required
                    value={addressForm.name}
                    onChange={(e) =>
                      setAddressForm({ ...addressForm, name: e.target.value })
                    }
                    className={errors.name ? styles.errorInput : ""}
                  />
                </label>
                <label> Address Line 1 * <input required value={addressForm.line1} className={errors.line1 ? styles.errorInput : ""} onChange={(e) => setAddressForm({ ...addressForm, line1: e.target.value })} placeholder="Street address, e.g. 82 Teaneck Rd" /></label>
                <label>
                  Apartment / Suite / Unit *
                  <input

                    value={addressForm.line2}
                    onChange={(e) =>
                      setAddressForm({ ...addressForm, line2: e.target.value })
                    }
                    placeholder="Apt 101, Suite 5B"
                  />
                </label>

                <div style={{ display: "flex", gap: "10px" }}>
                  <label style={{ flex: 1 }}>
                    City *
                    <input
                      required
                      value={addressForm.city}
                      onChange={(e) =>
                        setAddressForm({ ...addressForm, city: e.target.value })
                      }
                      className={errors.city ? styles.errorInput : ""}
                    />
                  </label>

                  <label style={{ flex: 1 }}>
                    State *

                    <input
                      required
                      value={addressForm.state}
                      onChange={(e) =>
                        setAddressForm({ ...addressForm, state: e.target.value })
                      }
                      className={errors.state ? styles.errorInput : ""}
                    />
                  </label>
                </div>

                <label>
                  ZIP Code *
                  <input
                    required
                    value={addressForm.zip}
                    onChange={(e) => handleZipChange(e.target.value)}
                    className={errors.zip ? styles.errorInput : ""}
                  />
                </label>
                <label>
                  Phone *
                  <input
                    required
                    value={addressForm.phone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    className={errors.phone ? styles.errorInput : ""}
                  />
                </label>
              </div>

              <div className={styles.modalFooter}>
                <button className={styles.modalCancel} onClick={() => setShowModal(false)}>
                  Cancel
                </button>

                <button
                  className={styles.modalSave}
                  onClick={editingAddress ? updateAddress : saveNewAddress}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
