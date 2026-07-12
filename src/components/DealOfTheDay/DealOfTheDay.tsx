"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, X } from 'lucide-react';
import styles from './DealOfTheDay.module.css';

const DealOfTheDay = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [timeLeft, setTimeLeft] = useState({
    hours: 14,
    minutes: 45,
    seconds: 0
  });

  useEffect(() => {
    // Check if user has seen the deal popup
    const hasSeenDeal = localStorage.getItem('hasSeenFlashDeal');
    
    if (!hasSeenDeal) {
      // Delay popup slightly for better UX
      const showTimer = setTimeout(() => {
        setIsVisible(true);
      }, 3500);
      return () => clearTimeout(showTimer);
    }
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    // We create a fake expiration time 14h 45m from mount
    const expireTime = new Date().getTime() + (14 * 60 * 60 * 1000) + (45 * 60 * 1000);

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = expireTime - now;

      if (distance < 0) {
        clearInterval(timer);
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
      } else {
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        setTimeLeft({ hours, minutes, seconds });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isVisible]);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem('hasSeenFlashDeal', 'true');
  };

  if (!isVisible) return null;

  // Ensure double digits
  const formatTime = (time: number) => time.toString().padStart(2, '0');

  return (
    <div className={styles.overlay}>
      <div className={styles.container}>
        <button 
          className={styles.closeButton} 
          onClick={handleClose}
          aria-label="Close deal popup"
        >
          <X size={24} />
        </button>

        <div className={styles.dealCard}>
          <div className={styles.imageWrapper}>
            <span className={styles.badge}>Save 25%</span>
            <img 
              src="https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=1000&auto=format&fit=crop" 
              alt="Sony WH-1000XM5 Wireless Headphones" 
              className={styles.image}
              style={{ width: '80%', height: 'auto', objectFit: 'contain' }}
            />
          </div>
          
          <div className={styles.content}>
            <h2 className={styles.title}>Sony WH-1000XM5 Wireless Noise Canceling</h2>
            <p className={styles.description}>
              Industry-leading noise cancellation. Two processors control 8 microphones for unprecedented noise cancellation. With Auto NC Optimizer, noise canceling is automatically optimized based on your wearing conditions.
            </p>
            
            <div className={styles.priceContainer}>
              <span className={styles.newPrice}>$298.00</span>
              <span className={styles.oldPrice}>$398.00</span>
            </div>
            
            <span className={styles.timerLabel}>Hurry up! Offer ends in:</span>
            <div className={styles.timerGrid}>
              <div className={styles.timeBox}>
                <span className={styles.timeValue}>{formatTime(timeLeft.hours)}</span>
                <span className={styles.timeLabel}>Hours</span>
              </div>
              <div className={styles.timeBox}>
                <span className={styles.timeValue}>{formatTime(timeLeft.minutes)}</span>
                <span className={styles.timeLabel}>Mins</span>
              </div>
              <div className={styles.timeBox}>
                <span className={styles.timeValue}>{formatTime(timeLeft.seconds)}</span>
                <span className={styles.timeLabel}>Secs</span>
              </div>
            </div>
            
            <Link 
              href="/products/sony-wh-1000xm5" 
              className={styles.shopButton}
              onClick={handleClose}
            >
              Claim Deal Now <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DealOfTheDay;
