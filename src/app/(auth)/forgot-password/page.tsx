"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Phone, Sun, Moon, CheckCircle2 } from "lucide-react";
import { useTheme } from "next-themes";
import styles from "./ForgotPassword.module.css";
import {
  forgotPasswordStep1,
  forgotPasswordStep2,
} from "@/actions/authActions";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    phone: "",
    otp: "",
  });

  const carouselImages = ["/imgs/person-12.jpg"];
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
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleOtpChange = (index: number, value: string) => {
    // only allow digits
    if (!/^\d*$/.test(value)) return;
    const newOtp = formData.otp.split("");
    while (newOtp.length < 6) newOtp.push("");
    newOtp[index] = value;
    const otpString = newOtp.join("").slice(0, 6);
    setFormData((prev) => ({ ...prev, otp: otpString }));

    if (value !== "" && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOtpKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace") {
      const newOtp = formData.otp.split("");
      while (newOtp.length < 6) newOtp.push("");
      if (newOtp[index] === "" && index > 0) {
        const prevInput = document.getElementById(`otp-${index - 1}`);
        if (prevInput) prevInput.focus();
        newOtp[index - 1] = "";
      } else {
        newOtp[index] = "";
      }
      setFormData((prev) => ({ ...prev, otp: newOtp.join("") }));
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData
      .getData("text")
      .slice(0, 6)
      .replace(/\D/g, "");
    if (pastedData) {
      setFormData((prev) => ({ ...prev, otp: pastedData }));
      const targetIndex = Math.min(pastedData.length, 5);
      const targetInput = document.getElementById(
        `otp-${targetIndex === 6 ? 5 : targetIndex}`,
      );
      if (targetInput) targetInput.focus();
    }
  };

  const handleStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.phone) return;

    setIsSubmitting(true);
    setApiError(null);

    const res = await forgotPasswordStep1({ phone: formData.phone });
    if (res.success) {
      setStep(2);
    } else {
      setApiError(res.error || "Failed to send reset code");
    }
    setIsSubmitting(false);
  };

  const handleStep2 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.otp) return;

    setIsSubmitting(true);
    setApiError(null);

    const res = await forgotPasswordStep2({
      phone: formData.phone,
      otp: formData.otp,
    });
    if (res.success) {
      router.push(
        `/reset-password?phone=${encodeURIComponent(formData.phone)}&otp=${encodeURIComponent(formData.otp)}`,
      );
    } else {
      setApiError(res.error || "Invalid verification code");
    }
    setIsSubmitting(false);
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
          <Link href="/" className={styles.logoWrapper}>
            <Image
              src="/imgs/logo-1.png"
              alt="Damian iTech Logo"
              width={160}
              height={48}
              className={`${styles.logoIcon} ${styles.logoLight}`}
              style={{ objectFit: "contain", width: "auto", height: "40px" }}
              priority
            />
            <Image
              src="/imgs/logo-3.png"
              alt="Damian iTech Logo Dark"
              width={160}
              height={48}
              className={`${styles.logoIcon} ${styles.logoDark}`}
              style={{ objectFit: "contain", width: "auto", height: "40px" }}
              priority
            />
          </Link>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                style={{ width: "100%" }}
              >
                <div className={styles.header}>
                  <h1 className={styles.title}>Forgot Password?</h1>
                  <p className={styles.subtitle}>
                    Enter your phone number to receive a reset code.
                  </p>
                </div>

                <form
                  className={styles.form}
                  onSubmit={handleStep1}
                  style={{ marginTop: "24px" }}
                >
                  <div className={styles.inputGroup}>
                    <label htmlFor="phone" className={styles.label}>
                      Phone Number
                    </label>
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
                        <Loader2
                          className="animate-spin"
                          size={20}
                          style={{
                            marginRight: "8px",
                            display: "inline-block",
                          }}
                        />
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
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                style={{ width: "100%" }}
              >
                <div className={styles.header}>
                  <h1 className={styles.title}>Verify WhatsApp</h1>
                  <p className={styles.subtitle}>
                    Please check your WhatsApp for a 6-digit reset code sent to{" "}
                    {formData.phone}.
                  </p>
                </div>

                <form
                  className={styles.form}
                  onSubmit={handleStep2}
                  style={{ marginTop: "24px" }}
                >
                  <div className={styles.inputGroup}>
                    <div
                      style={{
                        display: "flex",
                        gap: "12px",
                        justifyContent: "center",
                        margin: "16px 0",
                      }}
                    >
                      {[0, 1, 2, 3, 4, 5].map((index) => {
                        const digit = formData.otp[index] || "";
                        return (
                          <input
                            key={index}
                            id={`otp-${index}`}
                            type="text"
                            maxLength={1}
                            value={digit}
                            onChange={(e) =>
                              handleOtpChange(index, e.target.value)
                            }
                            onKeyDown={(e) => handleOtpKeyDown(index, e)}
                            onPaste={handleOtpPaste}
                            required={index === 0 ? false : undefined} // Only need HTML validation conceptually, but manual handles it
                            className={styles.input}
                            style={{
                              width: "48px",
                              height: "56px",
                              textAlign: "center",
                              fontSize: "24px",
                              fontWeight: "bold",
                              borderRadius: "12px",
                              padding: "0",
                            }}
                          />
                        );
                      })}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className={styles.submitBtn}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <div className={styles.btnContent}>
                        <Loader2
                          className="animate-spin"
                          size={20}
                          style={{
                            marginRight: "8px",
                            display: "inline-block",
                          }}
                        />
                        Verifying...
                      </div>
                    ) : (
                      "Verify Code"
                    )}
                  </button>

                  {apiError && (
                    <div className={styles.errorMessage}>{apiError}</div>
                  )}
                  <div
                    style={{
                      marginTop: "16px",
                      textAlign: "center",
                      fontSize: "14px",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setStep(1);
                        setApiError(null);
                      }}
                      style={{
                        background: "none",
                        border: "none",
                        color: "var(--primary-color, #2563eb)",
                        cursor: "pointer",
                        textDecoration: "underline",
                      }}
                    >
                      Change Phone Number
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          <div className={styles.footer} style={{ marginTop: "24px" }}>
            Remember your password?
            <Link href="/login" className={styles.link}>
              Log in
            </Link>
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
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Toggle Theme"
          >
            {mounted &&
              (theme === "dark" ? <Sun size={24} /> : <Moon size={24} />)}
          </button>

          <div className={styles.dots}>
            {carouselImages.map((_, idx) => (
              <button
                key={idx}
                type="button"
                className={`${styles.dot} ${idx === activeImage ? styles.dotActive : ""}`}
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
