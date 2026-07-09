"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Loader2, Github, User, Phone, Lock, Eye, EyeOff, Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';
import styles from './Signup.module.css';

export default function SignupPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [apiError, setApiError] = useState<string | null>(null);

  const carouselImages = [
    "/imgs/person-10.jpeg",
    "/imgs/person-12.jpg",  
    "/imgs/person-7.jpeg",
  ];
  const [activeImage, setActiveImage] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
    if (formData.password !== formData.confirmPassword) {
      setApiError("Passwords do not match!");
      return;
    }

    setIsSubmitting(true);
    setApiError(null);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          phone: formData.phone,
          password: formData.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to sign up');
      }

      alert('Account created successfully! Redirecting to login...');
      window.location.href = '/login';
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
            <h1 className={styles.title}>Sign Up Account</h1>
            <p className={styles.subtitle}>Enter your personal data to create your account.</p>
          </div>

          
          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.inputGroup}>
              <label htmlFor="fullName" className={styles.label}>Full Name</label>
              <div className={styles.inputWrapper}>
                <User className={styles.inputIcon} size={18} />
                <input 
                  type="text" 
                  id="fullName"
                  name="fullName"
                  required
                  className={`${styles.input} ${styles.inputWithIcon}`}
                  placeholder="eg. John Francisco"
                  value={formData.fullName}
                  onChange={handleChange}
                />
              </div>
            </div>

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

            <div className={styles.inputGroup}>
              <label htmlFor="password" className={styles.label}>Password</label>
              <div className={styles.inputWrapper}>
                <Lock className={styles.inputIcon} size={18} />
                <input 
                  type={showPassword ? "text" : "password"} 
                  id="password"
                  name="password"
                  required
                  className={`${styles.input} ${styles.inputWithIcon} ${styles.inputWithRightIcon}`}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button 
                  type="button" 
                  className={styles.passwordToggle}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="confirmPassword" className={styles.label}>Confirm Password</label>
              <div className={styles.inputWrapper}>
                <Lock className={styles.inputIcon} size={18} />
                <input 
                  type={showConfirmPassword ? "text" : "password"} 
                  id="confirmPassword"
                  name="confirmPassword"
                  required
                  className={`${styles.input} ${styles.inputWithIcon} ${styles.inputWithRightIcon}`}
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
                <button 
                  type="button" 
                  className={styles.passwordToggle}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
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
                  Signing Up...
                </div>
              ) : (
                "Sign Up"
              )}
            </button>

            {apiError && (
              <div className={styles.errorMessage}>{apiError}</div>
            )}
          </form>

          <div className={styles.footer}>
            Already have an account? 
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
