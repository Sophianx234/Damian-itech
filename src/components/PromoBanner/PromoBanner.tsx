"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './PromoBanner.module.css';

const promos = [
  {
    id: 1,
    title: "Boost Your Productivity",
    subtitle: "Essential Accessories for Work & Play",
    cta: "Browse Now",
    image: "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: 2,
    title: "Level Up Your Setup",
    subtitle: "Premium gear for the ultimate experience",
    cta: "Shop Gear",
    image: "https://images.unsplash.com/photo-1583394838336-acd977736f90?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: 3,
    title: "On-the-Go Audio",
    subtitle: "Never compromise on sound quality again",
    cta: "Listen Now",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
  }
];

const PromoBanner = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % promos.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className={styles.bannerSection}>
      <div className="container">
        <div className={styles.bannerContainer}>
          <AnimatePresence>
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: "easeInOut" }}
              className={styles.banner}
              style={{
                backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 100%), url(${promos[currentIndex].image})`
              }}
            >
              <div className={styles.content}>
                <motion.h2 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
                  className={styles.title}
                >
                  {promos[currentIndex].title}
                </motion.h2>
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
                  className={styles.subtitle}
                >
                  {promos[currentIndex].subtitle}
                </motion.p>
                <motion.button 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7, duration: 0.8, ease: "easeOut" }}
                  className="btn-primary"
                >
                  {promos[currentIndex].cta}
                </motion.button>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className={styles.dots}>
            {promos.map((_, index) => (
              <button 
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`${styles.dot} ${index === currentIndex ? styles.dotActive : ''}`}
                aria-label={`Go to promo ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PromoBanner;
