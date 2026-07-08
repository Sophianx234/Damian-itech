import React from 'react';
import styles from './FeaturesBar.module.css';

const FeaturesBar = () => {
  return (
    <section className={styles.featuresBar}>
      <div className={`container ${styles.featuresInner}`}>
        <div className={styles.featureItem}>
          <div className={styles.icon}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary-color)" strokeWidth="2"><path d="M5 12l5 5l10 -10"/></svg>
          </div>
          <span className={styles.featureText}>Free Shipping on Orders Over $50</span>
        </div>
        <div className={styles.divider}></div>
        <div className={styles.featureItem}>
          <div className={styles.icon}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary-color)" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </div>
          <span className={styles.featureText}>30-Day Money Back Guarantee</span>
        </div>
        <div className={styles.divider}></div>
        <div className={styles.featureItem}>
          <div className={styles.icon}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary-color)" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
          </div>
          <span className={styles.featureText}>24/7 Customer Support</span>
        </div>
      </div>
    </section>
  );
};

export default FeaturesBar;
