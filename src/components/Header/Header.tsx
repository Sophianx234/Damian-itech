import React from 'react';
import styles from './Header.module.css';

const Header = () => {
  return (
    <header className={styles.header}>
      <div className={`container ${styles.headerInner}`}>
        <div className={styles.logo}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.logoIcon}>
            <path d="M12 2L2 22H22L12 2Z" fill="var(--primary-color)"/>
            <path d="M12 8L7 18H17L12 8Z" fill="#fff"/>
          </svg>
          TechNest
        </div>
        
        <nav className={styles.nav}>
          <a href="#" className={styles.navLink}>Shop</a>
          <a href="#" className={styles.navLink}>New Arrivals</a>
          <a href="#" className={styles.navLink}>Best Sellers</a>
          <a href="#" className={styles.navLink}>About</a>
          <a href="#" className={styles.navLink}>Contact</a>
        </nav>

        <div className={styles.icons}>
          <button aria-label="Search">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.3-4.3"/></svg>
          </button>
          <button aria-label="User Account">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </button>
          <button aria-label="Cart" className={styles.cartBtn}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
            <span className={styles.cartBadge}>0</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
