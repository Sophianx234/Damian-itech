"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Loader2,GitBranchIcon } from 'lucide-react';
import styles from './Signup.module.css';

export default function SignupPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    password: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      alert('Account created successfully!');
    }, 1500);
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
              <input 
                type="text" 
                id="fullName"
                name="fullName"
                required
                className={styles.input}
                placeholder="eg. John Francisco"
                value={formData.fullName}
                onChange={handleChange}
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="phone" className={styles.label}>Phone Number</label>
              <input 
                type="tel" 
                id="phone"
                name="phone"
                required
                className={styles.input}
                placeholder="eg. 024 123 4567"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="password" className={styles.label}>Password</label>
              <input 
                type="password" 
                id="password"
                name="password"
                required
                className={styles.input}
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            <button 
              type="submit" 
              className={styles.submitBtn}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                "Sign Up"
              )}
            </button>
          </form>

          <div className={styles.footer}>
            Already have an account? 
            <Link href="/login" className={styles.link}>Log in</Link>
          </div>
        </div>

        {/* Right: Info Section */}
        <div className={styles.infoSection}>
          <div className={styles.infoBgGradient} />
          
          
        </div>
      </motion.div>
    </main>
  );
}
