"use client";

import React, { useState, useEffect } from "react";
import { User, Store, CreditCard, Truck, BellRing, Shield, Image as ImageIcon } from "lucide-react";
import styles from "./Settings.module.css";

type Tab = "profile" | "store" | "payments" | "shipping" | "notifications" | "security";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [user, setUser] = useState<{ fullName: string; email: string; role: string } | null>(null);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user);
        }
      })
      .catch((err) => console.error("Failed to fetch session", err));
  }, []);

  const tabs = [
    { id: "profile", label: "Profile & Account", icon: User },
    { id: "store", label: "Store Configuration", icon: Store },
    { id: "payments", label: "Payments & Checkout", icon: CreditCard },
    { id: "shipping", label: "Shipping & Delivery", icon: Truck },
    { id: "notifications", label: "Notifications", icon: BellRing },
    { id: "security", label: "Team & Security", icon: Shield },
  ];

  return (
    <div className={styles.pageContainer}>
      <h1 className={styles.pageTitle}>Settings</h1>

      <div className={styles.settingsLayout}>
        <aside className={styles.settingsSidebar}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                className={`${styles.tabBtn} ${activeTab === tab.id ? styles.tabBtnActive : ""}`}
                onClick={() => setActiveTab(tab.id as Tab)}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </aside>

        <main className={styles.settingsContent}>
          {activeTab === "profile" && (
            <div>
              <h2 className={styles.sectionTitle}>Profile & Account</h2>
              <p className={styles.sectionSubtitle}>Manage your personal information and account settings.</p>

              <div className={styles.profileAvatarSection}>
                <div className={styles.avatarCircle}>
                  {user ? user.fullName.charAt(0).toUpperCase() : "A"}
                </div>
                <div className={styles.avatarActions}>
                  <button className={styles.btnPrimary}>Upload Avatar</button>
                  <button className={styles.btnSecondary}>Remove</button>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Full Name</label>
                <input 
                  type="text" 
                  className={styles.formInput} 
                  defaultValue={user?.fullName || ""} 
                  placeholder="e.g. Damian X"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Email Address</label>
                <input 
                  type="email" 
                  className={styles.formInput} 
                  defaultValue={user?.email || ""} 
                  placeholder="e.g. admin@damian-itech.com"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Role</label>
                <input 
                  type="text" 
                  className={styles.formInput} 
                  defaultValue={user?.role || "Administrator"} 
                  disabled
                  style={{ opacity: 0.7, cursor: "not-allowed" }}
                />
              </div>

              <button className={styles.btnPrimary}>Save Changes</button>

              <div className={styles.divider}></div>

              <h2 className={styles.sectionTitle}>Change Password</h2>
              <p className={styles.sectionSubtitle}>Ensure your account is using a long, random password to stay secure.</p>
              
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Current Password</label>
                <input type="password" className={styles.formInput} />
              </div>
              
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>New Password</label>
                <input type="password" className={styles.formInput} />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Confirm New Password</label>
                <input type="password" className={styles.formInput} />
              </div>

              <button className={styles.btnPrimary}>Update Password</button>
            </div>
          )}

          {activeTab === "store" && (
            <div>
              <h2 className={styles.sectionTitle}>Store Configuration</h2>
              <p className={styles.sectionSubtitle}>Manage global settings for your e-commerce platform.</p>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Store Name</label>
                <input type="text" className={styles.formInput} defaultValue="Damian iTech" />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Support Email</label>
                <input type="email" className={styles.formInput} defaultValue="support@damian-itech.com" />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Contact Phone</label>
                <input type="text" className={styles.formInput} defaultValue="+233 55 123 4567" />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Physical Address (For Invoices)</label>
                <textarea 
                  className={styles.formInput} 
                  rows={3} 
                  defaultValue={"Accra, Ghana\nWest Africa"}
                  style={{ resize: "vertical" }}
                ></textarea>
              </div>

              <button className={styles.btnPrimary}>Save Configuration</button>
            </div>
          )}

          {["payments", "shipping", "notifications", "security"].includes(activeTab) && (
            <div className={styles.comingSoon}>
              <ImageIcon size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
              <h2 className={styles.sectionTitle}>Coming Soon</h2>
              <p className={styles.sectionSubtitle}>This module is currently under development.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
