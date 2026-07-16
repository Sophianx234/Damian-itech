"use client";

import React, { useState } from "react";
import { Loader2, Phone } from "lucide-react";
import styles from "./CheckoutPhoneForm.module.css";

export default function CheckoutPhoneForm({ userId, onComplete }: { userId: string, onComplete: () => void }) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/user/${userId}/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber }),
      });
      
      const res = await response.json();
      if (res.success) {
        onComplete();
      } else {
        setError(res.error || "Failed to update phone number.");
      }
    } catch (err) {
      setError("Internal server error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Complete Your Profile</h3>
      <p className={styles.subtitle}>Please provide your phone number to proceed with checkout.</p>
      
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.inputGroup}>
          <label htmlFor="phoneNumber" className={styles.label}>Phone Number</label>
          <div className={styles.inputWrapper}>
            <Phone className={styles.inputIcon} size={18} />
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              required
              className={styles.input}
              placeholder="eg. 024 123 4567"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
          </div>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <button type="submit" disabled={isSubmitting} className={styles.submitBtn}>
          {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : "Save & Continue"}
        </button>
      </form>
    </div>
  );
}
