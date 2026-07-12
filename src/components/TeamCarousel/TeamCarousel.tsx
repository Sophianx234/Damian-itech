"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import styles from './TeamCarousel.module.css';

const teamMembers = [
  {
    name: "Damian X",
    role: "Founder & CEO",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=600&auto=format&fit=crop",
  },
  {
    name: "Ava Sterling",
    role: "Head of Operations",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop",
  },
  {
    name: "Marcus Cole",
    role: "Lead Hardware Tech",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&auto=format&fit=crop",
  },
  {
    name: "Jordan Lee",
    role: "Customer Experience",
    image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=600&auto=format&fit=crop",
  }
];

// Triplicate data to allow seamless infinite loop
const extendedData = [...teamMembers, ...teamMembers, ...teamMembers];

export default function TeamCarousel() {
  const [activeIndex, setActiveIndex] = useState(teamMembers.length); // Start at index 4 (start of middle chunk)
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
    // If we reach the start of the 3rd chunk (index 8)
    if (activeIndex === teamMembers.length * 2) {
      const timeout = setTimeout(() => {
        setIsTransitioning(false);
        setActiveIndex(teamMembers.length); // Silently jump back to index 4
      }, 600); // 600ms matches the CSS transition duration
      return () => clearTimeout(timeout);
    }
  }, [activeIndex, isTransitioning]);

  const handleDotClick = (index: number) => {
    setIsTransitioning(true);
    // Jump to the corresponding item in the middle chunk
    setActiveIndex(index + teamMembers.length);
  };

  // Determine the "real" index (0 to 3) for the active dot highlight
  const realIndex = activeIndex % teamMembers.length;

  return (
    <section className={styles.teamSection}>
      <div className="container">
        <div className={styles.teamHeader}>
          <h2 className={styles.sectionTitle}>The Minds Behind The Tech</h2>
          <p className={styles.teamSubtitle}>Meet the team dedicated to elevating your digital lifestyle.</p>
        </div>

        <div className={styles.carouselContainer}>
          <div 
            className={styles.carouselTrack}
            style={{ 
              '--active-index': activeIndex,
              '--transition-duration': isTransitioning ? '0.6s' : '0s'
            } as React.CSSProperties}
          >
            {extendedData.map((member, index) => (
              <div 
                key={`${member.name}-${index}`} 
                className={styles.carouselSlide}
              >
                <div className={styles.teamCard}>
                  <div className={styles.teamImageWrapper}>
                    <Image 
                      src={member.image} 
                      alt={member.name} 
                      fill 
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      className={styles.teamImage} 
                    />
                  </div>
                  <div className={styles.teamInfo}>
                    <h3 className={styles.teamName}>{member.name}</h3>
                    <p className={styles.teamRole}>{member.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.dotsContainer}>
          {teamMembers.map((_, index) => (
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
