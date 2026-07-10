"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Settings,
  LogOut,
  Sun,
  Moon,
} from "lucide-react";
import { useTheme } from "next-themes";
import styles from "./AdminLayout.module.css";

const navItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Products", href: "/admin/products", icon: Package },
  { label: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { label: "Customers", href: "/admin/customers", icon: Users },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  if (!mounted) return null;

  return (
    <div className={styles.adminLayout}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.logoContainer}>
          <Link href="/">
            <Image
              src={theme === "dark" ? "/imgs/logo-3.png" : "/imgs/logo-1.png"}
              alt="Damian iTech Admin"
              width={160}
              height={40}
              style={{ objectFit: "contain", height: "40px", width: "auto" }}
            />
          </Link>
        </div>

        <nav className={styles.nav}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.navItem} ${
                  isActive ? styles.navItemActive : ""
                }`}
              >
                <Icon size={20} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className={styles.mainContent}>
        {/* Top Header */}
        <header className={styles.header}>
          <h1 className={styles.headerTitle}>
            {navItems.find((n) => n.href === pathname)?.label || "Admin Portal"}
          </h1>
          <div className={styles.headerActions}>
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className={styles.iconBtn}
              title="Toggle Theme"
            >
              {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button onClick={handleLogout} className={styles.iconBtn} title="Logout">
              <LogOut size={20} />
            </button>
          </div>
        </header>

        {/* Dynamic Content Wrapper */}
        <main className={styles.contentWrapper}>{children}</main>
      </div>
    </div>
  );
}
