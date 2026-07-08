import React from 'react';
import styles from './PromoBanner.module.css';

const PromoBanner = () => {
  return (
    <section className={styles.bannerSection}>
      <div className={`container`}>
        <div className={styles.banner}>
          <div className={styles.content}>
            <h2 className={styles.title}>Boost Your Productivity</h2>
            <p className={styles.subtitle}>Essential Accessories for Work & Play</p>
            <button className="btn-primary">Browse Now</button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PromoBanner;
