import React from 'react';
import styles from './FeaturesBar.module.css';

const features = [
  {
    text: "Free Shipping on Orders Over $50",
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary-color)" strokeWidth="2"><path d="M5 12l5 5l10 -10"/></svg>
  },
  {
    text: "30-Day Money Back Guarantee",
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary-color)" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
  },
  {
    text: "24/7 Customer Support",
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary-color)" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
  }
];

const FeaturesBar = () => {
  return (
    <section className={styles.featuresBar}>
      <div className={`container ${styles.featuresContainer}`}>
        <div className={styles.featuresInner}>
          {/* First set of features */}
          {features.map((feature, idx) => (
            <React.Fragment key={`f1-${idx}`}>
              <div className={styles.featureItem}>
                <div className={styles.icon}>{feature.icon}</div>
                <span className={styles.featureText}>{feature.text}</span>
              </div>
              {idx < features.length - 1 && <div className={styles.divider}></div>}
            </React.Fragment>
          ))}
          
          <div className={`${styles.divider} ${styles.mobileOnlyDivider}`}></div>

          {/* Duplicated set for seamless mobile marquee */}
          {features.map((feature, idx) => (
            <React.Fragment key={`f2-${idx}`}>
              <div className={`${styles.featureItem} ${styles.duplicateItem}`}>
                <div className={styles.icon}>{feature.icon}</div>
                <span className={styles.featureText}>{feature.text}</span>
              </div>
              {idx < features.length - 1 && <div className={`${styles.divider} ${styles.duplicateItem}`}></div>}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesBar;
