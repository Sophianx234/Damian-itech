"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './TopBrands.module.css';

const brands = [
  { name: "APPLE", icon: "apple" },
  { name: "NVIDIA", icon: "nvidia" },
  { name: "SONY", icon: "sony" },
  { name: "DJI", icon: "dji" },
  { name: "ASUS", icon: "asus" },
  { name: "PLAYSTATION", icon: "playstation" },
  { name: "BOSE", icon: "bose" },
  { name: "INTEL", icon: "intel" },
  { name: "DELL", icon: "dell" },
  { name: "LG", icon: "lg" },
  { name: "SENNHEISER", icon: "sennheiser" }
];

// Create 3 sets for perfect infinite looping
const extendedBrands = [...brands, ...brands, ...brands];

const TopBrands = () => {
  const [itemsPerView, setItemsPerView] = useState(5);
  // Start in the middle set
  const [currentIndex, setCurrentIndex] = useState(brands.length);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) setItemsPerView(2);
      else if (window.innerWidth < 1024) setItemsPerView(3);
      else setItemsPerView(5);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isHovered) return;
    
    const timer = setInterval(() => {
      handleNext();
    }, 3000); // Slides every 3 seconds
    
    return () => clearInterval(timer);
  }, [isHovered, currentIndex]);

  const handleNext = () => {
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev + 1);
  };

  const handlePrev = () => {
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev - 1);
  };

  const handleTransitionEnd = () => {
    setIsTransitioning(false);
    // If we've scrolled into the third set, jump back to the second set seamlessly
    if (currentIndex >= brands.length * 2) {
      setCurrentIndex(currentIndex - brands.length);
    } 
    // If we've scrolled into the first set, jump forward to the second set seamlessly
    else if (currentIndex <= 0) {
      setCurrentIndex(currentIndex + brands.length);
    }
  };

  const handleDotClick = (index: number) => {
    setIsTransitioning(true);
    setCurrentIndex(brands.length + index);
  };

  // The active dot is always modulo the original brands length
  const activeDotIndex = currentIndex % brands.length;

  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.header}>
          <h2 className={styles.title}>Shop by Top Brands</h2>
        </div>
        
        <div 
          className={styles.carouselContainer}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <button 
            className={`${styles.navButton} ${styles.prevButton}`} 
            onClick={handlePrev}
            aria-label="Previous brands"
          >
            <ChevronLeft size={24} />
          </button>

          <div className={styles.viewport}>
            <div 
              className={styles.track}
              style={{ 
                transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`,
                transition: isTransitioning ? 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)' : 'none'
              }}
              onTransitionEnd={handleTransitionEnd}
            >
              {extendedBrands.map((brand, index) => (
                <div 
                  className={styles.slideItem} 
                  key={`${brand.name}-${index}`}
                  style={{ width: `${100 / itemsPerView}%` }}
                >
                  <Link 
                    href={`/search?q=${brand.name.toLowerCase()}`} 
                    className={styles.brandItem}
                  >
                    <img 
                      src={`https://cdn.simpleicons.org/${brand.icon}/000000`} 
                      alt={`${brand.name} logo`} 
                      className={styles.brandLogo}
                    />
                    <h3 className={styles.brandText}>{brand.name}</h3>
                  </Link>
                </div>
              ))}
            </div>
          </div>

          <button 
            className={`${styles.navButton} ${styles.nextButton}`} 
            onClick={handleNext}
            aria-label="Next brands"
          >
            <ChevronRight size={24} />
          </button>
        </div>

        <div className={styles.dots}>
          {brands.map((_, i) => (
            <button
              key={i}
              className={`${styles.dot} ${i === activeDotIndex ? styles.activeDot : ''}`}
              onClick={() => handleDotClick(i)}
              aria-label={`Go to brand ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TopBrands;
