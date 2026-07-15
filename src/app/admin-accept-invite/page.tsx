"use client";

import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2, Lock, ShieldCheck, CheckCircle2 } from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "../(auth)/login/Login.module.css"; // Reuse login styles

function InviteForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inviteId = searchParams.get("inviteId");
  
  const [step, setStep] = useState<"otp" | "password" | "success">("otp");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<any>(null);

  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const carouselImages = ["/imgs/person-11.jpg", "/imgs/person-13.jpg"];
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

  const handleOtpChange = (index: number, value: string) => {
    // only allow digits
    if (!/^\d*$/.test(value)) return;
    const newOtp = otp.split("");
    while (newOtp.length < 6) newOtp.push("");
    newOtp[index] = value;
    const otpString = newOtp.join("").slice(0, 6);
    setOtp(otpString);

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
      const newOtp = otp.split("");
      while (newOtp.length < 6) newOtp.push("");
      if (newOtp[index] === "" && index > 0) {
        const prevInput = document.getElementById(`otp-${index - 1}`);
        if (prevInput) prevInput.focus();
        newOtp[index - 1] = "";
      } else {
        newOtp[index] = "";
      }
      setOtp(newOtp.join(""));
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData
      .getData("text")
      .slice(0, 6)
      .replace(/\D/g, "");
    if (pastedData) {
      setOtp(pastedData);
      const targetIndex = Math.min(pastedData.length, 5);
      const targetInput = document.getElementById(
        `otp-${targetIndex === 6 ? 5 : targetIndex}`,
      );
      if (targetInput) targetInput.focus();
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteId) {
      setApiError("Invalid invite link.");
      return;
    }
    
    setIsSubmitting(true);
    setApiError(null);

    try {
      const res = await fetch("/api/admin/invite/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteId, otp }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        if (data.errors) setValidationErrors(data.errors);
        throw new Error(data.error || "Failed to verify OTP.");
      }

      setStep("password");
    } catch (err: any) {
      setApiError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSetupPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setApiError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setApiError("Password must be at least 8 characters long.");
      return;
    }
    
    setIsSubmitting(true);
    setApiError(null);

    try {
      const res = await fetch("/api/admin/invite/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteId, otp, password }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        if (data.errors) setValidationErrors(data.errors);
        throw new Error(data.error || "Failed to set password.");
      }

      setStep("success");
    } catch (err: any) {
      setApiError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!inviteId) {
    return (
      <main className={styles.authContainer}>
        <div style={{ textAlign: "center", padding: "40px", backgroundColor: "var(--card-bg)", borderRadius: "12px", border: "1px solid var(--border-primary)" }}>
          <h2 style={{ color: "var(--text-primary)" }}>Invalid Invitation Link</h2>
          <p style={{ color: "var(--text-muted)", marginTop: "12px" }}>The invitation link is missing or malformed.</p>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.authContainer}>
      <motion.div
        className={styles.splitWrapper}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
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

          {step === "otp" && (
            <>
              <div className={styles.header}>
                <h1 className={styles.title}>Verify Invitation</h1>
                <p className={styles.subtitle}>
                  We sent a 6-digit OTP code to your phone number on WhatsApp. Enter it below to verify your invitation.
                </p>
              </div>

              <form className={styles.form} onSubmit={handleVerifyOtp}>
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
                      const digit = otp[index] || "";
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
                          required={index === 0 ? false : undefined}
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
                  disabled={isSubmitting || otp.length < 6}
                >
                  {isSubmitting ? (
                    <div className={styles.btnContent}>
                      <Loader2 className="animate-spin" size={20} />
                      Verifying...
                    </div>
                  ) : (
                    "Verify Code"
                  )}
                </button>

                {apiError && (
                  <div className={styles.errorMessage}>
                    {apiError}
                    {validationErrors && (
                      <ul style={{ marginTop: '8px', paddingLeft: '20px', fontSize: '13px', textAlign: 'left' }}>
                        {Object.entries(validationErrors).map(([field, errs]: any) => (
                          <li key={field}>{field}: {errs.join(', ')}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </form>
            </>
          )}

          {step === "password" && (
            <>
              <div className={styles.header}>
                <h1 className={styles.title}>Secure Your Account</h1>
                <p className={styles.subtitle}>
                  Set a strong password to complete your admin account setup.
                </p>
              </div>

              <form className={styles.form} onSubmit={handleSetupPassword}>
                <div className={styles.inputGroup}>
                  <label htmlFor="password" className={styles.label}>
                    New Password
                  </label>
                  <div className={styles.inputWrapper}>
                    <Lock className={styles.inputIcon} size={18} />
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      required
                      className={`${styles.input} ${styles.inputWithIcon} ${styles.inputWithRightIcon}`}
                      placeholder="At least 8 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
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
                  <label htmlFor="confirmPassword" className={styles.label}>
                    Confirm Password
                  </label>
                  <div className={styles.inputWrapper}>
                    <Lock className={styles.inputIcon} size={18} />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      id="confirmPassword"
                      required
                      className={`${styles.input} ${styles.inputWithIcon} ${styles.inputWithRightIcon}`}
                      placeholder="Repeat your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
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
                      Saving...
                    </div>
                  ) : (
                    "Complete Setup"
                  )}
                </button>

                {apiError && (
                  <div className={styles.errorMessage}>
                    {apiError}
                    {validationErrors && (
                      <ul style={{ marginTop: '8px', paddingLeft: '20px', fontSize: '13px', textAlign: 'left' }}>
                        {Object.entries(validationErrors).map(([field, errs]: any) => (
                          <li key={field}>{field}: {errs.join(', ')}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </form>
            </>
          )}

          {step === "success" && (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{ display: "inline-flex", justifyContent: "center", alignItems: "center", width: "80px", height: "80px", borderRadius: "50%", backgroundColor: "rgba(16, 185, 129, 0.1)", color: "#10b981", marginBottom: "24px" }}>
                <CheckCircle2 size={48} />
              </div>
              <h1 className={styles.title} style={{ marginBottom: "12px" }}>Setup Complete!</h1>
              <p className={styles.subtitle} style={{ marginBottom: "32px" }}>
                Your admin account is now secure and ready to use.
              </p>
              <Link href="/login" className={styles.submitBtn} style={{ display: "inline-block", textDecoration: "none", width: "100%", textAlign: "center" }}>
                Go to Login
              </Link>
            </div>
          )}

        </div>

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

export default function AdminAcceptInvitePage() {
  return (
    <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}><Loader2 className="animate-spin" /></div>}>
      <InviteForm />
    </Suspense>
  );
}
