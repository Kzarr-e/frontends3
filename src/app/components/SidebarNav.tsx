"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

// Icons
import { User, Package, Settings, ShoppingCart } from "lucide-react";

import styles from "./SidebarNav.module.css";

export default function SidebarNav() {
  const pathname = usePathname();

  const links = [
    { href: "/profile", label: "My Profile", icon: <User size={18} /> },
    { href: "/order", label: "Orders", icon: <Package size={18} /> },
    { href: "/settings", label: "Settings", icon: <Settings size={18} /> },
    { href: "/", label: "Shop", icon: <ShoppingCart size={18} /> },
  ];

  return (
    <aside className={styles.sidebar}>
      <nav className={styles.nav}>
        {links.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`${styles.navItem} ${
              pathname === item.href ? styles.active : ""
            }`}
          >
            {item.icon}
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
