"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Star } from 'lucide-react';
import styles from './Testimonials.module.css';

const testimonialsData = [
  {
    id: 1,
    name: 'Sarah Jenkins',
    role: 'Creative Director',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=250&auto=format&fit=crop',
    quote: 'The level of service and the uncompromising quality of the hardware is unmatched. Damian iTech has completely transformed how our studio approaches hardware upgrades. Highly recommended.',
  },
  {
    id: 2,
    name: 'Michael Chen',
    role: 'Lead Developer',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=250&auto=format&fit=crop',
    quote: 'Finding a reliable tech retailer that truly understands premium hardware is rare. Their next-day delivery and elite customer support make them my absolute go-to for all development gear.',
  },
  {
    id: 3,
    name: 'Elena Rodriguez',
    role: 'Product Designer',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=250&auto=format&fit=crop',
    quote: 'I value aesthetic perfection and performance above all else. Damian iTech delivers on both fronts. Their curated selection ensures I only get the absolute best equipment available.',
  },
  {
    id: 4,
    name: 'David Okafor',
    role: 'Systems Architect',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=250&auto=format&fit=crop',
    quote: 'When deploying enterprise-grade setups, you cannot afford compromises. Damian iTech delivers flawless logistics and elite hardware consistently. An exceptional partner for serious professionals.',
  },
  {
    id: 5,
    name: 'Jessica Walsh',
    role: 'UX Researcher',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=250&auto=format&fit=crop',
    quote: 'The shopping experience is as refined as the products they sell. The minimalist interface paired with their intense customer-first support makes upgrading tech a truly premium experience.',
  }
];

// Triplicate data to allow seamless infinite loop
const extendedData = [...testimonialsData, ...testimonialsData, ...testimonialsData];

export default function Testimonials() {
  const [activeIndex, setActiveIndex] = useState(testimonialsData.length); // Start at index 5 (start of middle chunk)
  const [isTransitioning, setIsTransitioning] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setActiveIndex((current) => current + 1);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Handle silent reset for infinite loop
  useEffect(() => {
    // If we reach the start of the 3rd chunk (index 10)
    if (activeIndex === testimonialsData.length * 2) {
      const timeout = setTimeout(() => {
        setIsTransitioning(false);
        setActiveIndex(testimonialsData.length); // Silently jump back to index 5
      }, 600); // 600ms matches the CSS transition duration
      return () => clearTimeout(timeout);
    }
    
    // If we click a dot and jump backwards to the 1st chunk
    if (activeIndex === testimonialsData.length - 1 && !isTransitioning) {
       // We don't usually need a backwards reset unless we add manual swipe/back buttons
    }
  }, [activeIndex, isTransitioning]);

  const handleDotClick = (index: number) => {
    setIsTransitioning(true);
    // Jump to the corresponding item in the middle chunk
    setActiveIndex(index + testimonialsData.length);
  };

  // Determine the "real" index (0 to 4) for the active dot highlight
  const realIndex = activeIndex % testimonialsData.length;

  return (
    <section className={styles.testimonialsSection}>
      <div className="container">
        <div className={styles.headerArea}>
          <span className={styles.subHeading}>Testimonial</span>
          <h2 className={styles.mainHeading}>We Care About Our Customers Experience Too</h2>
        </div>

        <div className={styles.carouselContainer}>
          <div 
            className={styles.carouselTrack}
            style={{ 
              '--active-index': activeIndex,
              '--transition-duration': isTransitioning ? '0.6s' : '0s'
            } as React.CSSProperties}
          >
            {extendedData.map((testimonial, index) => (
              <div 
                key={`${testimonial.id}-${index}`} 
                className={styles.carouselSlide}
              >
                <div className={styles.card}>
                  <div className={styles.avatarWrapper}>
                    <Image
                      src={testimonial.image}
                      alt={testimonial.name}
                      width={64}
                      height={64}
                      className={styles.avatar}
                    />
                  </div>
                  
                  <div className={styles.content}>
                    <p className={styles.quote}>"{testimonial.quote}"</p>
                  </div>

                  <div className={styles.divider}></div>

                  <div className={styles.footer}>
                    <div className={styles.userInfo}>
                      <p className={styles.userName}>{testimonial.name}</p>
                      <p className={styles.userRole}>{testimonial.role}</p>
                    </div>
                    <div className={styles.stars}>
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={16} fill="#8B5CF6" color="#8B5CF6" />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.dotsContainer}>
          {testimonialsData.map((_, index) => (
            <button
              key={index}
              onClick={() => handleDotClick(index)}
              className={`${styles.dot} ${index === realIndex ? styles.activeDot : ''}`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
