"use client";

import React, { useState } from 'react';
import { X, Send } from 'lucide-react';
import styles from './SwapProposalModal.module.css';

interface SwapProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  storeProductTitle: string;
  storeProductPrice: string;
}

export default function SwapProposalModal({ isOpen, onClose, storeProductTitle, storeProductPrice }: SwapProposalModalProps) {
  const [offeredDevice, setOfferedDevice] = useState('');
  const [deviceCondition, setDeviceCondition] = useState('Pristine');
  const [cashTopUp, setCashTopUp] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const template = `Hello Damian iTech, I want to propose a swap for your ${storeProductTitle} (GH₵ ${storeProductPrice}). I am offering my ${offeredDevice}. Condition: ${deviceCondition}. Cash Top-up: GH₵ ${cashTopUp}. I will send the pictures of my device below.`;
    
    const encodedMessage = encodeURIComponent(template);
    const phoneNumber = "233206192823"; // Damian iTech WhatsApp number
    const url = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    
    window.open(url, '_blank');
    onClose();
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} role="dialog" aria-modal="true" onClick={e => e.stopPropagation()}>
        <button 
          className={styles.closeBtn} 
          onClick={onClose} 
          aria-label="Close modal"
        >
          <X size={20} strokeWidth={2.5} />
        </button>
        
        <h2 className={styles.title}>Propose a Swap</h2>

        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="offeredDevice">Offered Device</label>
            <input
              id="offeredDevice"
              type="text"
              className={styles.input}
              placeholder="What device are you offering? (e.g., iPhone 13 Pro Max)"
              value={offeredDevice}
              onChange={(e) => setOfferedDevice(e.target.value)}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="deviceCondition">Device Condition</label>
            <select
              id="deviceCondition"
              className={styles.select}
              value={deviceCondition}
              onChange={(e) => setDeviceCondition(e.target.value)}
              required
            >
              <option value="Pristine">Pristine</option>
              <option value="Open Box">Open Box</option>
              <option value="UK Used">UK Used</option>
              <option value="Used">Used</option>
              <option value="Minor Scratches">Minor Scratches</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="cashTopUp">Cash Top-up</label>
            <input
              id="cashTopUp"
              type="text"
              className={styles.input}
              placeholder="Cash difference you are adding/requesting (GH₵)"
              value={cashTopUp}
              onChange={(e) => setCashTopUp(e.target.value)}
              required
            />
          </div>

          <button type="submit" className={styles.submitBtn}>
            Send via WhatsApp <Send size={18} strokeWidth={2.5} />
          </button>
        </form>
      </div>
    </div>
  );
}
