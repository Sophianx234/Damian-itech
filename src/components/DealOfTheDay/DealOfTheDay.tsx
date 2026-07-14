"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, X } from 'lucide-react';
import styles from './DealOfTheDay.module.css';

const DealOfTheDay = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [dealData, setDealData] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const hasSeenDeal = localStorage.getItem('hasSeenFlashDeal');
    if (hasSeenDeal) return;

    // Fetch dynamic deal settings from DB
    fetch("/api/admin/settings")
      .then(res => res.json())
      .then(data => {
        if (data.success && data.settings && data.settings.flashSaleActive) {
          // Check if expired
          if (data.settings.flashSaleEndTime) {
            const expireTime = new Date(data.settings.flashSaleEndTime).getTime();
            const now = new Date().getTime();
            if (expireTime <= now) {
              return; // Sale has expired, do not show
            }
          }
          
          setDealData(data.settings);
          const showTimer = setTimeout(() => {
            setIsVisible(true);
          }, 3500);
          return () => clearTimeout(showTimer);
        }
      })
      .catch(err => console.error("Failed to load flash sale settings", err));
  }, []);

  useEffect(() => {
    if (!isVisible || !dealData || !dealData.flashSaleEndTime) return;

    const expireTime = new Date(dealData.flashSaleEndTime).getTime();

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = expireTime - now;

      if (distance < 0) {
        clearInterval(timer);
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        setIsVisible(false);
      } else {
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        setTimeLeft({ hours, minutes, seconds });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isVisible, dealData]);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem('hasSeenFlashDeal', 'true');
  };

  if (!isVisible || !dealData) return null;

  const formatTime = (time: number) => time.toString().padStart(2, '0');

  // Calculate percentage discount
  const oldPrice = dealData.flashSaleOldPrice || 0;
  const newPrice = dealData.flashSaleNewPrice || 0;
  const discountPercent = oldPrice > 0 ? Math.round(((oldPrice - newPrice) / oldPrice) * 100) : 0;

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
            {discountPercent > 0 && (
              <span className={styles.badge}>Save {discountPercent}%</span>
            )}
            <img 
              src={dealData.flashSaleImage || "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=1000&auto=format&fit=crop"} 
              alt={dealData.flashSaleTitle || "Deal of the Day"} 
              className={styles.image}
              style={{ width: '80%', height: 'auto', objectFit: 'contain' }}
            />
          </div>
          
          <div className={styles.content}>
            <h2 className={styles.title}>{dealData.flashSaleTitle}</h2>
            <p className={styles.description}>{dealData.flashSaleDescription}</p>
            
            <div className={styles.priceContainer}>
              <span className={styles.newPrice}>${Number(newPrice).toFixed(2)}</span>
              {oldPrice > 0 && (
                <span className={styles.oldPrice}>${Number(oldPrice).toFixed(2)}</span>
              )}
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
              href={dealData.flashSaleLink || "/"} 
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
