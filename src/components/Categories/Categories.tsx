import React from 'react';
import Link from 'next/link';
import styles from './Categories.module.css';

const Categories = () => {
  return (
    <section className={styles.categoriesSection}>
      <div className={`container ${styles.grid}`}>
        <Link href="/new-arrivals" className={styles.categoryCard}>
          <h3 className={styles.title}>New Arrivals</h3>
          <div className={styles.imageWrapper}>
            <img src="/imgs/vr-1.png" alt="New Arrivals" />
          </div>
          <span className={`btn-primary ${styles.btn}`}>Shop New</span>
        </Link>
        
        <Link href="/best-sellers" className={styles.categoryCard}>
          <h3 className={styles.title}>Best Sellers</h3>
          <div className={styles.imageWrapper}>
            <img src="/imgs/h-6.png" alt="Best Sellers" />
          </div>
          <span className={`btn-primary ${styles.btn}`}>Shop Bestsellers</span>
        </Link>
      </div>
    </section>
  );
};

export default Categories;
