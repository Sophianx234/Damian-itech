import React from 'react';
import styles from './Hero.module.css';

const Hero = () => {
  return (
    <section className={styles.hero}>
      <div className={`container ${styles.heroInner}`}>
        <div className={styles.content}>
          <h1 className={styles.title}>Top Tech Gear<br/>for Your Lifestyle</h1>
          <p className={styles.subtitle}>Explore the latest gadgets & accessories.</p>
          <a href="#shop" className="btn-primary">Shop Now</a>
        </div>
        <div className={styles.imageContainer}>
          {/* using an unsplash image resembling gadgets / headphones */}
          <img src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" alt="Tech Gadgets" className={styles.heroImage} />
        </div>
      </div>
    </section>
  );
};

export default Hero;
