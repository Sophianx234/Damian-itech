"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';
import styles from './Header.module.css';
import { useCart } from '../../context/CartContext';

const Header = () => {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const { cartCount } = useCart();

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className={styles.header}>
      <div className={`container ${styles.headerInner}`}>
        <div className={styles.logo}>
          <Image 
            src="/imgs/logo-1.png" 
            alt="TechNest Logo" 
            width={160} 
            height={48} 
            className={`${styles.logoIcon} ${styles.logoLight}`} 
            style={{ objectFit: "contain", width: "auto", height: "40px" }}
            priority
          />
          <Image 
            src="/imgs/logo-3.png" 
            alt="TechNest Logo Dark" 
            width={160} 
            height={48} 
            className={`${styles.logoIcon} ${styles.logoDark}`} 
            style={{ objectFit: "contain", width: "auto", height: "40px" }}
            priority
          />
        </div>
        
        <nav className={styles.nav}>
          <a href="#" className={styles.navLink}>Shop</a>
          <a href="#" className={styles.navLink}>New Arrivals</a>
          <a href="#" className={styles.navLink}>Best Sellers</a>
          <a href="#" className={styles.navLink}>About</a>
          <a href="#" className={styles.navLink}>Contact</a>
        </nav>

        <div className={styles.icons}>
          <button aria-label="Toggle Theme" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className={styles.themeToggle}>
            {mounted && (
              <>
                <Sun className={`${styles.icon} ${styles.sun}`} size={20} />
                <Moon className={`${styles.icon} ${styles.moon}`} size={20} />
              </>
            )}
          </button>
          <button aria-label="Search">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.3-4.3"/></svg>
          </button>
          <button aria-label="User Account">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </button>
          <Link href="/cart" className={styles.cartBtn} aria-label="Cart">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
            <span className={styles.cartBadge}>{cartCount}</span>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
