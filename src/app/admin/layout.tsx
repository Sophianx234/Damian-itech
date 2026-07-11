"use client";

import React, { useEffect, useState, useRef } from "react";
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
  Bell,
  AlertTriangle,
  Info,
  X,
  ChevronDown
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

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  time: string;
  link: string;
  isCritical: boolean;
  isRead: boolean;
  isDismissed: boolean;
}

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
  const [isNotifMenuOpen, setIsNotifMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifMenuOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    if (isNotifMenuOpen || isUserMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isNotifMenuOpen, isUserMenuOpen]);

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

    fetch("/api/admin/notifications")
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setNotifications(data.data);
        }
      })
      .catch(err => console.error("Failed to fetch notifications", err));
  }, []);

  const handleNotificationAction = async (action: string, notificationId?: string) => {
    try {
      // Optimistic update
      if (action === 'mark_read' && notificationId) {
        setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n));
      } else if (action === 'dismiss' && notificationId) {
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
      } else if (action === 'mark_all_read') {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      } else if (action === 'clear_all') {
        setNotifications([]);
      }

      await fetch('/api/admin/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, notificationId })
      });
    } catch (err) {
      console.error(`Failed to perform action ${action} on notification`, err);
    }
  };

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

            <div className={styles.notifContainer} ref={notifRef}>
              <button 
                className={styles.iconBtn} 
                onClick={() => setIsNotifMenuOpen(!isNotifMenuOpen)}
                aria-label="Notifications"
              >
                <Bell size={18} />
                {notifications.filter(n => !n.isRead).length > 0 && (
                  <span className={styles.notifBadge}>
                    {notifications.filter(n => !n.isRead).length}
                  </span>
                )}
              </button>

              {isNotifMenuOpen && (
                <div className={styles.notifDropdown}>
                  <div className={styles.dropdownHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p className={styles.dropdownName}>Notifications</p>
                    {notifications.length > 0 && (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          onClick={() => handleNotificationAction('mark_all_read')}
                          style={{ background: 'none', border: 'none', fontSize: '11px', color: 'var(--primary-color)', cursor: 'pointer', padding: 0 }}
                        >
                          Mark all read
                        </button>
                        <button 
                          onClick={() => handleNotificationAction('clear_all')}
                          style={{ background: 'none', border: 'none', fontSize: '11px', color: '#ef4444', cursor: 'pointer', padding: 0 }}
                        >
                          Clear all
                        </button>
                      </div>
                    )}
                  </div>
                  <div className={styles.notifList}>
                    {notifications.length === 0 ? (
                      <div className={styles.notifEmpty}>No new notifications</div>
                    ) : (
                      notifications.map(n => (
                        <div key={n.id} className={`${styles.notifItem} ${!n.isRead ? styles.notifItemUnread : ''}`}>
                          <Link 
                            href={n.link} 
                            style={{ display: 'flex', gap: '12px', flex: 1, textDecoration: 'none' }}
                            onClick={() => {
                              if (!n.isRead) handleNotificationAction('mark_read', n.id);
                              setIsNotifMenuOpen(false);
                            }}
                          >
                            <div className={n.isCritical ? styles.notifIconCritical : styles.notifIconNormal}>
                              {n.isCritical ? <AlertTriangle size={14} /> : <Info size={14} />}
                            </div>
                            <div className={styles.notifContent}>
                              <p className={styles.notifTitle}>{n.title}</p>
                              <p className={styles.notifMessage}>{n.message}</p>
                              <p className={styles.notifTime}>{new Date(n.time).toLocaleString()}</p>
                            </div>
                          </Link>
                          <button 
                            className={styles.dismissBtn}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleNotificationAction('dismiss', n.id);
                            }}
                            title="Dismiss"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                  {notifications.length > 4 && (
                    <div className={styles.notifMoreIndicator}>
                      <ChevronDown size={16} />
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className={styles.userMenuContainer} ref={userMenuRef}>
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

        {notifications.filter(n => !n.isRead).length > 0 && (
          <div className={styles.notificationBanner}>
            <AlertTriangle size={16} className={styles.bannerIcon} />
            <div className={styles.bannerText}>
              <strong>Attention needed:</strong> You have {notifications.filter(n => !n.isRead).length} unread notification{notifications.filter(n => !n.isRead).length > 1 ? 's' : ''} requiring your action.
            </div>
            <button className={styles.bannerBtn} onClick={() => setIsNotifMenuOpen(true)}>
              View Details
            </button>
          </div>
        )}

        {/* Dynamic Content Wrapper */}
        <main className={styles.contentWrapper}>{children}</main>
      </div>
    </div>
  );
}
