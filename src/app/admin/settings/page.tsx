"use client";

import React, { useState, useEffect } from "react";
import { User, Store, CreditCard, Truck, BellRing, Shield, Image as ImageIcon, Trash2, Plus } from "lucide-react";
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

          {activeTab === "shipping" && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <h2 className={styles.sectionTitle} style={{ margin: 0 }}>Shipping & Delivery</h2>
                <button className={styles.btnPrimary}>Save Settings</button>
              </div>
              <p className={styles.sectionSubtitle}>Configure your delivery zones, shipping rates, and pickup options.</p>

              <div className={styles.settingsBlock}>
                <h3 className={styles.blockTitle}>General Options</h3>
                
                <div className={styles.checkboxGroup}>
                  <input type="checkbox" id="localPickup" className={styles.checkboxInput} defaultChecked />
                  <label htmlFor="localPickup" className={styles.checkboxLabel}>
                    <strong>Enable Local Pickup</strong>
                    <span className={styles.helpText}>Allow customers to pick up their orders from your physical store for free.</span>
                  </label>
                </div>

                <div className={styles.formGroup} style={{ marginTop: '24px' }}>
                  <label className={styles.formLabel}>Free Shipping Threshold (₵)</label>
                  <input type="number" className={styles.formInput} defaultValue={5000} placeholder="e.g. 5000" />
                  <span className={styles.helpText} style={{ display: 'block', marginTop: '6px' }}>Orders above this amount will automatically qualify for free shipping. Leave blank or 0 to disable.</span>
                </div>
              </div>

              <div className={styles.divider}></div>

              <div className={styles.settingsBlock}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 className={styles.blockTitle} style={{ margin: 0 }}>Delivery Zones</h3>
                  <button className={styles.btnSecondary} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px' }}>
                    <Plus size={16} /> Add Zone
                  </button>
                </div>
                
                <div className={styles.zonesContainer}>
                  {[
                    { id: 1, name: "Accra", time: "1-2 Business Days", rate: 50 },
                    { id: 2, name: "Kumasi", time: "3-5 Business Days", rate: 80 },
                    { id: 3, name: "Other Regions", time: "5-7 Business Days", rate: 120 }
                  ].map(zone => (
                    <div key={zone.id} className={styles.zoneRow}>
                      <div className={styles.zoneGrid}>
                        <div className={styles.formGroup} style={{ marginBottom: 0 }}>
                          <label className={styles.formLabel} style={{ fontSize: '12px' }}>Zone Name</label>
                          <input type="text" className={styles.formInput} defaultValue={zone.name} />
                        </div>
                        <div className={styles.formGroup} style={{ marginBottom: 0 }}>
                          <label className={styles.formLabel} style={{ fontSize: '12px' }}>Est. Delivery Time</label>
                          <input type="text" className={styles.formInput} defaultValue={zone.time} />
                        </div>
                        <div className={styles.formGroup} style={{ marginBottom: 0 }}>
                          <label className={styles.formLabel} style={{ fontSize: '12px' }}>Flat Rate (₵)</label>
                          <input type="number" className={styles.formInput} defaultValue={zone.rate} />
                        </div>
                      </div>
                      <button className={styles.iconBtnDanger} aria-label="Delete Zone">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {["payments", "notifications", "security"].includes(activeTab) && (
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
