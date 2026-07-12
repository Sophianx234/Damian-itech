"use client";

import React, { useState } from "react";
import styles from "./Contact.module.css";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ text: '', type: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatusMsg({ text: '', type: '' });

    try {
      const res = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (data.success) {
        setStatusMsg({ text: 'Message sent successfully. Our Tech Support team will contact you shortly.', type: 'success' });
        setFormData({ name: '', email: '', phone: '', message: '' });
      } else {
        setStatusMsg({ text: data.message || 'Something went wrong. Please try again.', type: 'error' });
      }
    } catch (err) {
      setStatusMsg({ text: 'Failed to send message. Please check your connection.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.pageContainer}>
      {/* Hero Banner 1 */}
      <div className={styles.heroBanner}>
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>Contact • Get Support • AncoreXHub</h1>
        </div>
      </div>

      {/* Central Sub-Headline */}
      <div className={styles.subHeadlinePanel}>
        <p className={styles.subHeadlineText}>
          Need assistance? Contact us using one of the options below our team is always here to help!
        </p>
      </div>

      {/* Main Content Grid */}
      <div className={styles.contentWrapper}>
        <div className={styles.contactGrid}>
          {/* Left Column: Email Support Form */}
          <div className={styles.formColumn}>
            <h2 className={styles.columnTitle}>Email Support</h2>
            
            {statusMsg.text && (
              <div style={{
                padding: '12px',
                marginBottom: '16px',
                borderRadius: '8px',
                backgroundColor: statusMsg.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                color: statusMsg.type === 'success' ? '#10b981' : '#ef4444',
                border: `1px solid ${statusMsg.type === 'success' ? '#10b981' : '#ef4444'}`
              }}>
                {statusMsg.text}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Full name*</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} className={styles.formInput} placeholder="Your name" required />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Email support*</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} className={styles.formInput} placeholder="Your email address" required />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Contact number</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className={styles.formInput} placeholder="Your phone number" />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Your message*</label>
                <textarea name="message" value={formData.message} onChange={handleChange} className={styles.formTextarea} placeholder="Please describe your issue or query..." required></textarea>
              </div>
              <button type="submit" className={styles.submitBtn} disabled={loading}>
                {loading ? 'Submitting...' : 'Submit'}
              </button>
            </form>
          </div>

          {/* Right Column: Tech Support Details & Map */}
          <div className={styles.infoColumn}>
            <h2 className={styles.columnTitle}>Tech Support & Queries</h2>
            <div className={styles.infoList}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>General Enquiries</span>
                <span className={styles.infoValue}>+1 (800) 123-4567<br/>support@ancorexhub.tech</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Tech Support</span>
                <span className={styles.infoValue}>+1 (800) 987-6543<br/>helpdesk@ancorexhub.tech</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Operating Hours</span>
                <span className={styles.infoValue}>Monday - Friday: 9AM - 8PM EST<br/>Weekends: 10AM - 4PM EST</span>
              </div>
            </div>
            
            {/* Minimalist Dark-Themed Map (Google Maps via CSS invert trick) */}
            <div className={styles.mapContainer}>
              <iframe 
                src="https://maps.google.com/maps?q=Mensah+Sarbah+Hall,+University+of+Ghana&t=&z=15&ie=UTF8&iwloc=&output=embed" 
                className={styles.mapIframe} 
                allowFullScreen={false} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>
        </div>
      </div>


    </div>
  );
}
