import React from 'react';
import styles from './Categories.module.css';

const Categories = () => {
  return (
    <section className={styles.categoriesSection}>
      <div className={`container ${styles.grid}`}>
        <div className={styles.categoryCard}>
          <h3 className={styles.title}>New Arrivals</h3>
          <div className={styles.imageWrapper}>
            <img src="https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" alt="New Arrivals" />
          </div>
          <button className={`btn-primary ${styles.btn}`}>Shop New</button>
        </div>
        
        <div className={styles.categoryCard}>
          <h3 className={styles.title}>Best Sellers</h3>
          <div className={styles.imageWrapper}>
            <img src="https://images.unsplash.com/photo-1583394838336-acd977736f90?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" alt="Best Sellers" />
          </div>
          <button className={`btn-primary ${styles.btn}`}>Shop Bestsellers</button>
        </div>
      </div>
    </section>
  );
};

export default Categories;
