"use client";

import React, { useEffect, useState } from "react";
import { Edit, Trash2, X, MapPin } from "lucide-react";

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

const COUNTRIES = [
  { name: "India", iso: "IN", dial_code: "+91", min: 10, max: 10 },
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

  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState(null);

  const [editing, setEditing] = useState(false);
  const [toast, setToast] = useState(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    countryIso: "IN",
    dial_code: "+91",
  });

  const [addresses, setAddresses] = useState([]);

  // modal
  const [showModal, setShowModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(false);
  const [addressForm, setAddressForm] = useState({
    title: "Home",
    name: "",
    line1: "",
    city: "",
    state: "",
    pincode: "",
    phone: "",
    countryIso: "IN",
    dial_code: "+91",
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
  if (!user) return <div className={styles.loading}>Loading profile…</div>;

  /* ================================
     Save Profile
  ================================= */
  async function saveProfile() {
    const country = COUNTRIES[0];

    const body = {
      name: form.name,
      email: form.email,
      phone: combineDial(country.dial_code, form.phone),
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
      title: "Home",
      name: "",
      line1: "",
      city: "",
      state: "",
      pincode: "",
      phone: "",
      countryIso: "IN",
      dial_code: "+91",
    });
    setShowModal(true);
  }

  function openEditAddress(addr) {
    setEditingAddress(true);
    setAddressForm(addr);
    setShowModal(true);
  }

  async function saveNewAddress() {
    const res = await fetch(`${API}/api/user/address/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(addressForm),
    });

    const data = await res.json();
    if (!data.success) return setToast({ type: "error", message: data.message });

    setAddresses([data.address, ...addresses]);
    setToast({ type: "success", message: "Address added" });
    setShowModal(false);
  }

  async function updateAddress() {
    const res = await fetch(`${API}/api/user/address/update/${addressForm._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(addressForm),
    });

    const data = await res.json();
    if (!data.success) return setToast({ type: "error", message: data.message });

    setAddresses(addresses.map((a) => (a._id === addressForm._id ? data.address : a)));
    setToast({ type: "success", message: "Address updated" });
    setShowModal(false);
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
                  <span className={styles.value}>{user.phone || "Not added"}</span>
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
                    <strong>{addr.title}</strong>
                    <p>{addr.line1}</p>
                    <p>{addr.city}, {addr.state}</p>
                    <p>Pincode: {addr.pincode}</p>
                    <p>Phone: {addr.phone}</p>
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
            <div className={styles.modal}>
              <div className={styles.modalHeader}>
                <h3>{editingAddress ? "Edit Address" : "Add Address"}</h3>
                <button className={styles.modalClose} onClick={() => setShowModal(false)}>
                  <X size={18} />
                </button>
              </div>

              <div className={styles.modalBody}>
                <label>Title <input value={addressForm.title} onChange={(e) => setAddressForm({ ...addressForm, title: e.target.value })} /></label>
                <label>Address Line <input value={addressForm.line1} onChange={(e) => setAddressForm({ ...addressForm, line1: e.target.value })} /></label>
                <label>City <input value={addressForm.city} onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })} /></label>
                <label>State <input value={addressForm.state} onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })} /></label>
                <label>Pincode <input value={addressForm.pincode} onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })} /></label>
                <label>Phone <input value={addressForm.phone} onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })} /></label>
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
