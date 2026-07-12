"use client";

import React from "react";
import { useSettings } from "../../context/SettingsContext";
import styles from "./Footer.module.css";

const Footer = () => {
  const { settings } = useSettings();
  const storeName = settings?.storeName || "Damian iTech";

  return (
    <footer className={styles.footer}>
      {/* Newsletter Section */}
      <div className={styles.newsletterBanner}>
        <div className={styles.newsletterImage} />
        <div className={styles.newsletterContent}>
          <h2 className={styles.newsletterTitle}>Unlock 15% off your next product upgrade.</h2>
          <form className={styles.newsletterForm} onSubmit={(e) => {
            e.preventDefault();
            alert("Subscribed! Check your email for your 15% off code.");
          }}>
            <input type="email" className={styles.newsletterInput} placeholder="Enter email here" required />
            <button type="submit" className={styles.newsletterSubmit}>Submit</button>
          </form>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className={styles.mainFooter}>
        <div className={`container ${styles.footerGrid}`}>
          <div className={styles.column}>
            <h4 className={styles.colTitle}>{storeName}</h4>
            <p className={styles.aboutText} style={{ color: '#737373', fontSize: '14px', lineHeight: '1.6', marginBottom: '16px', maxWidth: '250px' }}>
              Your premium destination for the latest gadgets and electronics. We deliver cutting-edge technology with unparalleled customer service.
            </p>
            <a href="mailto:support@damianitech.com" style={{ color: '#FFFFFF', fontSize: '14px', textDecoration: 'none', fontWeight: '500' }}>support@damianitech.com</a>
          </div>

          <div className={styles.column}>
            <h4 className={styles.colTitle}>Quick Links</h4>
            <ul className={styles.links}>
              <li>
                <a href="#">Shop Collection</a>
              </li>
              <li>
                <a href="#">About Us</a>
              </li>
              <li>
                <a href="/contact">Contact</a>
              </li>
              <li>
                <a href="#">Our Blog</a>
              </li>
            </ul>
          </div>

          <div className={styles.column}>
            <h4 className={styles.colTitle}>Customer Service</h4>
            <ul className={styles.links}>
              <li>
                <a href="#">Shipping Info</a>
              </li>
              <li>
                <a href="#">Return Policy</a>
              </li>
              <li>
                <a href="#">Support Center</a>
              </li>
              <li>
                <a href="#">FAQ</a>
              </li>
            </ul>
          </div>

          <div className={styles.column}>
            <h4 className={styles.colTitle}>Follow Us</h4>
            <div className={styles.socialIcons}>
              <a href="#" aria-label="Facebook">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>
              <a href="#" aria-label="Twitter">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
                </svg>
              </a>
              <a href="#" aria-label="Instagram">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
              <a href="#" aria-label="YouTube">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z" />
                  <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        <div className={styles.bottomBar}>
          <p>
            &copy; {new Date().getFullYear()} {storeName}. All Rights Reserved.
          </p>
          <div style={{ display: 'flex', gap: '24px' }}>
            <a href="#" style={{ color: '#737373', textDecoration: 'none', transition: 'color 0.2s ease' }} onMouseOver={(e) => e.currentTarget.style.color = '#FFFFFF'} onMouseOut={(e) => e.currentTarget.style.color = '#737373'}>Privacy Policy</a>
            <a href="#" style={{ color: '#737373', textDecoration: 'none', transition: 'color 0.2s ease' }} onMouseOver={(e) => e.currentTarget.style.color = '#FFFFFF'} onMouseOut={(e) => e.currentTarget.style.color = '#737373'}>Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
