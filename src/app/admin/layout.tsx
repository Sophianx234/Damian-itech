"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Settings,
  LogOut,
  Search,
  Sun,
  Moon,
  User,
  Bell
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
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<{ fullName: string, role: string } | null>(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user);
        }
      })
      .catch((err) => console.error("Failed to fetch session", err));
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setIsUserMenuOpen(false);
    router.push("/login");
  };

  // Instead of returning null and breaking the layout's rendering of children,
  // we just handle the mounted state gracefully for theme icons.
  return (
    <div className={styles.adminLayout}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.logoContainer}>
          <Link href="/admin">
            <Image
              src="/imgs/logo-1.png"
              alt="Damian iTech Logo"
              width={160}
              height={40}
              className={`${styles.logoIcon} ${styles.logoLight}`}
              style={{ objectFit: "contain", width: "auto", height: "32px" }}
              priority
            />
            <Image
              src="/imgs/logo-3.png"
              alt="Damian iTech Logo Dark"
              width={160}
              height={40}
              className={`${styles.logoIcon} ${styles.logoDark}`}
              style={{ objectFit: "contain", width: "auto", height: "32px" }}
              priority
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
                <Icon size={18} />
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
          <div className={styles.headerLeft}>
            <h1 className={styles.greeting}>
              Hello, {user ? user.fullName.split(" ")[0] : "Admin"}
            </h1>
          </div>

          <div className={styles.headerRight}>
            <div className={styles.searchContainer}>
              <Search size={16} className={styles.searchIcon} />
              <input 
                type="text" 
                placeholder="Search..." 
                className={styles.searchInput}
              />
            </div>

            <button
              aria-label="Toggle Theme"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className={styles.iconBtn}
            >
              {mounted && (theme === "dark" ? <Sun size={18} /> : <Moon size={18} />)}
            </button>

            <button className={styles.iconBtn}>
              <Bell size={18} />
            </button>

            <div className={styles.userMenuContainer}>
              <button
                aria-label="User Account"
                className={styles.userBtn}
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              >
                <div className={styles.avatar}>
                  {user ? user.fullName.charAt(0).toUpperCase() : "A"}
                </div>
              </button>

              {isUserMenuOpen && (
                <div className={styles.userDropdown}>
                  <div className={styles.dropdownHeader}>
                    <p className={styles.dropdownName}>{user?.fullName || "Admin"}</p>
                    <p className={styles.dropdownRole}>{user?.role || "Administrator"}</p>
                  </div>
                  <Link href="/admin/settings" className={styles.dropdownItem}>
                    <User size={16} /> Profile
                  </Link>
                  <button onClick={handleLogout} className={styles.dropdownItemLogout}>
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dynamic Content Wrapper */}
        <main className={styles.contentWrapper}>{children}</main>
      </div>
    </div>
  );
}
