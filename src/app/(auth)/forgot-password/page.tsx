"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Loader2, Phone, Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';
import styles from './ForgotPassword.module.css';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    phone: '',
  });

  const carouselImages = [
    "/imgs/person-12.jpg",
  ];
  const [activeImage, setActiveImage] = useState(0);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      setActiveImage((prev) => (prev + 1) % carouselImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [carouselImages.length]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.phone) return;

    setIsSubmitting(true);
    setApiError(null);

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: formData.phone })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to send reset code');
      }

      // Success
      router.push(`/reset-password?phone=${encodeURIComponent(formData.phone)}`);
    } catch (err: any) {
      setApiError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className={styles.authContainer}>
      <motion.div 
        className={styles.splitWrapper}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        {/* Left: Form Section */}
        <div className={styles.formSection}>
          <div className={styles.logoWrapper}>
            <Image 
              src="/imgs/logo-1.png" 
              alt="TechNest Logo" 
              width={160} 
              height={48} 
              className={`${styles.logoIcon} ${styles.logoLight}`} 
              style={{ objectFit: "contain", width: "auto", height: "40px" }}
              priority
            />
            <Image 
              src="/imgs/logo-3.png" 
              alt="TechNest Logo Dark" 
              width={160} 
              height={48} 
              className={`${styles.logoIcon} ${styles.logoDark}`} 
              style={{ objectFit: "contain", width: "auto", height: "40px" }}
              priority
            />
          </div>

          <div className={styles.header}>
            <h1 className={styles.title}>Forgot Password?</h1>
            <p className={styles.subtitle}>Enter your phone number to receive a reset code.</p>
          </div>

          <form className={styles.form} onSubmit={handleSubmit} style={{ marginTop: '24px' }}>
            <div className={styles.inputGroup}>
              <label htmlFor="phone" className={styles.label}>Phone Number</label>
              <div className={styles.inputWrapper}>
                <Phone className={styles.inputIcon} size={18} />
                <input 
                  type="tel" 
                  id="phone"
                  name="phone"
                  required
                  className={`${styles.input} ${styles.inputWithIcon}`}
                  placeholder="eg. 024 123 4567"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
            </div>

            <button 
              type="submit" 
              className={styles.submitBtn}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className={styles.btnContent}>
                  <Loader2 className="animate-spin" size={20} />
                  Sending Code...
                </div>
              ) : (
                "Send Reset Code"
              )}
            </button>

            {apiError && (
              <div className={styles.errorMessage}>{apiError}</div>
            )}
          </form>

          <div className={styles.footer}>
            Remember your password? 
            <Link href="/login" className={styles.link}>Log in</Link>
          </div>
        </div>

        {/* Right: Info Section */}
        <div className={styles.infoSection}>
          <div className={styles.carouselContainer}>
            {carouselImages.map((img, idx) => (
              <motion.div
                key={idx}
                className={styles.carouselSlide}
                initial={{ opacity: 0 }}
                animate={{ opacity: idx === activeImage ? 1 : 0 }}
                transition={{ duration: 1 }}
                style={{ backgroundImage: `url(${img})` }}
              />
            ))}
          </div>
          <div className={styles.infoBgGradient} />
          
          <button 
            className={styles.themeToggle} 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label="Toggle Theme"
          >
            {mounted && (theme === 'dark' ? <Sun size={24} /> : <Moon size={24} />)}
          </button>
          
          
          <div className={styles.dots}>
            {carouselImages.map((_, idx) => (
              <button
                key={idx}
                type="button"
                className={`${styles.dot} ${idx === activeImage ? styles.dotActive : ''}`}
                onClick={() => setActiveImage(idx)}
                aria-label={`Go to image ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </motion.div>
    </main>
  );
}
