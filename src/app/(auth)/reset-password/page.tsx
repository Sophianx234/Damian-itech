"use client";

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Loader2, Lock, Eye, EyeOff, Sun, Moon, KeyRound } from 'lucide-react';
import { useTheme } from 'next-themes';
import styles from './ResetPassword.module.css';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const phoneParam = searchParams.get('phone') || '';

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    otp: '',
    password: '',
    confirmPassword: ''
  });

  const carouselImages = [
    "/imgs/person-6.jpeg",
    "/imgs/person-7.jpeg",
    "/imgs/person-8.jpeg",
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
      setApiError("Passwords do not match.");
      return;
    }

    if (!phoneParam) {
      setApiError("Phone number is missing. Please restart the password reset process.");
      return;
    }

    setIsSubmitting(true);
    setApiError(null);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          phone: phoneParam,
          otp: formData.otp,
          password: formData.password
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to reset password');
      }

      alert('Password updated successfully!');
      router.push('/login');
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
            <h1 className={styles.title}>Reset Password</h1>
            <p className={styles.subtitle}>Enter the 6-digit code sent to your phone and your new password.</p>
          </div>

          <form className={styles.form} onSubmit={handleSubmit} style={{ marginTop: '24px' }}>
            <div className={styles.inputGroup}>
              <label htmlFor="otp" className={styles.label}>Verification Code</label>
              <div className={styles.inputWrapper}>
                <KeyRound className={styles.inputIcon} size={18} />
                <input 
                  type="text" 
                  id="otp"
                  name="otp"
                  required
                  maxLength={6}
                  className={`${styles.input} ${styles.inputWithIcon}`}
                  placeholder="Enter 6-digit code"
                  value={formData.otp}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="password" className={styles.label}>New Password</label>
              <div className={styles.inputWrapper}>
                <Lock className={styles.inputIcon} size={18} />
                <input 
                  type={showPassword ? "text" : "password"} 
                  id="password"
                  name="password"
                  required
                  className={`${styles.input} ${styles.inputWithIcon} ${styles.inputWithRightIcon}`}
                  placeholder="Enter new password"
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
                  placeholder="Confirm new password"
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
                <Loader2 className="animate-spin" size={20} />
              ) : (
                "Update Password"
              )}
            </button>

            {apiError && (
              <div className={styles.errorMessage}>{apiError}</div>
            )}
          </form>

          <div className={styles.footer}>
            Remembered your password? 
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
          
          <div className={styles.infoContent}>
            <h2 className={styles.infoTitle}>Secure Account</h2>
            <p className={styles.infoSubtitle}>Almost there! Create a new strong password.</p>
          </div>

          <div className={styles.stepsContainer}>
            <div className={`${styles.stepCard} ${styles.stepCardActive}`}>
              <div className={styles.stepNum}>1</div>
              <div className={styles.stepText}>Verify<br/>code</div>
            </div>
            <div className={styles.stepCard}>
              <div className={styles.stepNum}>2</div>
              <div className={styles.stepText}>New<br/>password</div>
            </div>
            <div className={styles.stepCard}>
              <div className={styles.stepNum}>3</div>
              <div className={styles.stepText}>Login<br/>successfully</div>
            </div>
          </div>

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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Loader2 className="animate-spin" size={40} /></div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
