"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Sun, Moon, User, Package, Heart, LogOut } from "lucide-react";
import styles from "./Header.module.css";
import { useCart } from "../../context/CartContext";

const Header = () => {
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<{ fullName: string } | null>(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const { cartCount } = useCart();

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
  };

  return (
    <header className={styles.header}>
      <div className={`container ${styles.headerInner}`}>
        <Link href="/" className={styles.logo}>
          <Image
            src="/imgs/logo-1.png"
            alt="Damian iTech Logo"
            width={160}
            height={48}
            className={`${styles.logoIcon} ${styles.logoLight}`}
            style={{ objectFit: "contain", width: "auto", height: "40px" }}
            priority
          />
          <Image
            src="/imgs/logo-3.png"
            alt="Damian iTech Logo Dark"
            width={160}
            height={48}
            className={`${styles.logoIcon} ${styles.logoDark}`}
            style={{ objectFit: "contain", width: "auto", height: "40px" }}
            priority
          />
        </Link>

        <nav className={styles.nav}>
          <a href="#" className={styles.navLink}>
            Shop
          </a>
          <a href="#" className={styles.navLink}>
            New Arrivals
          </a>
          <a href="#" className={styles.navLink}>
            Best Sellers
          </a>
          <a href="#" className={styles.navLink}>
            About
          </a>
          <a href="#" className={styles.navLink}>
            Contact
          </a>
        </nav>

        <div className={styles.icons}>
          <button
            aria-label="Toggle Theme"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className={styles.themeToggle}
          >
            {mounted && (
              <>
                <Sun className={`${styles.icon} ${styles.sun}`} size={20} />
                <Moon className={`${styles.icon} ${styles.moon}`} size={20} />
              </>
            )}
          </button>
          <button aria-label="Search">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.3-4.3" />
            </svg>
          </button>

          <div className={styles.userMenuContainer}>
            <button
              aria-label="User Account"
              className={styles.userBtn}
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              {user && (
                <span className={styles.userGreeting}>
                  Hi, {user.fullName.split(" ")[0]}
                </span>
              )}
            </button>

            {isUserMenuOpen && (
              <div className={styles.userDropdown}>
                {user ? (
                  <>
                    <Link href="/account" className={styles.dropdownItem}>
                      <User size={16} /> My Account
                    </Link>
                    <Link href="/orders" className={styles.dropdownItem}>
                      <Package size={16} /> Orders
                    </Link>
                    <Link href="/wishlist" className={styles.dropdownItem}>
                      <Heart size={16} /> Wishlist
                    </Link>
                    <Link
                      href=""
                      onClick={handleLogout}
                      className={styles.dropdownItemx}
                    >
                      {" "}
                      Logout
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="/login" className={styles.dropdownItemx}>
                      {" "}
                      Log In
                    </Link>
                    <>
                      <Link href="/login" className={styles.dropdownItem}>
                        <User size={16} /> My Account
                      </Link>
                      <Link href="/login" className={styles.dropdownItem}>
                        <Package size={16} /> Orders
                      </Link>
                      <Link href="/login" className={styles.dropdownItem}>
                        <Heart size={16} /> Wishlist
                      </Link>
                    </>
                  </>
                )}
              </div>
            )}
          </div>

          <Link href="/cart" className={styles.cartBtn} aria-label="Cart">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            <span className={styles.cartBadge}>{cartCount}</span>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
