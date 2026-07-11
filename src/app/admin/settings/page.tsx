"use client";

import React, { useState, useEffect } from "react";
import { User, Store, CreditCard, Truck, BellRing, Shield, Image as ImageIcon, Trash2, Plus, ChevronUp, ChevronDown, X, Loader2 } from "lucide-react";
import styles from "./Settings.module.css";


type Tab = "profile" | "store" | "payments" | "shipping" | "notifications" | "security";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [user, setUser] = useState<{ _id: string; fullName: string; email: string; role: string; phone: string } | null>(null);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  
  // Settings State
  const [settings, setSettings] = useState<any>({
    storeName: "Damian iTech",
    supportEmail: "support@damian-itech.com",
    contactPhone: "+233 55 123 4567",
    physicalAddress: "Accra, Ghana\nWest Africa",
    isLocalPickupEnabled: true,
    pickupLocations: [
      { id: "1", name: "Main HQ", address: "123 Oxford Street, Osu, Accra" },
      { id: "2", name: "Kumasi Branch", address: "Adum, Kumasi City Mall" }
    ],
    freeDeliveryThreshold: 5000,
    isDeliveryEnabled: true,
    deliveryZones: [
      { id: "1", name: "Accra", time: "1-2 Business Days", rate: 50 },
      { id: "2", name: "Kumasi", time: "3-5 Business Days", rate: 80 },
      { id: "3", name: "Other Regions", time: "5-7 Business Days", rate: 120 }
    ],
    adminAlertNewOrder: true,
    adminAlertNewUser: true,
    adminAlertLowStock: true,
    lowStockThreshold: 5,
    customerEmailOrderConfirm: true,
    customerEmailOrderShipped: true,
    customerEmailReview: true,
    customerEmailWelcome: true,
    require2FA: false,
    sessionTimeout: true,
  });

  const [expandedSections, setExpandedSections] = useState({ general: true, zones: false, adminAlerts: true, customerAlerts: true, teamMembers: true, security: true });
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const toggleSection = (section: 'general' | 'zones' | 'adminAlerts' | 'customerAlerts' | 'teamMembers' | 'security') => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Invite Modal State
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteData, setInviteData] = useState({ fullName: "", phone: "", role: "manager" });
  const [isInviting, setIsInviting] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null);

  useEffect(() => {
    // Fetch user
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user);
        }
      })
      .catch((err) => console.error("Failed to fetch session", err));

    // Fetch store settings
    fetch("/api/admin/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.settings) {
          setSettings(data.settings);
        }
      })
      .catch((err) => console.error("Failed to fetch settings", err));

    // Fetch team members
    fetchTeamMembers();
  }, []);

  const fetchTeamMembers = async () => {
    try {
      const res = await fetch("/api/admin/team");
      const data = await res.json();
      if (data.success) {
        setTeamMembers(data.teamMembers);
      }
    } catch (error) {
      console.error("Failed to fetch team members", error);
    }
  };

  const handleUpdateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    setSaveMessage(null);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (data.success) {
        setSaveMessage({ type: 'success', text: 'Settings saved successfully!' });
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      setSaveMessage({ type: 'error', text: error.message || 'Failed to save settings' });
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveMessage(null), 3000);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsInviting(true);
    setInviteError(null);
    setInviteSuccess(null);

    try {
      const res = await fetch("/api/admin/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inviteData),
      });
      const data = await res.json();
      
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to send invitation.");
      }

      setInviteSuccess("Invitation sent successfully via WhatsApp!");
      setTimeout(() => {
        setIsInviteModalOpen(false);
        setInviteSuccess(null);
        setInviteData({ fullName: "", phone: "", role: "manager" });
      }, 3000);
    } catch (err: any) {
      setInviteError(err.message);
    } finally {
      setIsInviting(false);
    }
  };

  const handleRemoveTeamMember = async (id: string) => {
    if (!confirm("Are you sure you want to remove this team member's admin access?")) return;
    try {
      const res = await fetch(`/api/admin/team/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        fetchTeamMembers(); // refresh
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to remove team member");
    }
  };

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
      <div className={styles.headerActions}>
        <div>
          <h1 className={styles.pageTitle}>Settings</h1>
          <p className={styles.pageSubtitle}>Manage your store preferences and account configurations.</p>
        </div>
        {saveMessage && (
          <div className={`${styles.toast} ${saveMessage.type === 'success' ? styles.toastSuccess : styles.toastError}`}>
            {saveMessage.text}
          </div>
        )}
      </div>

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
                <Icon size={18} strokeWidth={2.5} />
                {tab.label}
              </button>
            );
          })}
        </aside>

        <main className={styles.settingsContent}>
          {activeTab === "profile" && (
            <div className={styles.sectionGroup}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Profile</h2>
                <p className={styles.sectionSubtitle}>Update your personal information and photo.</p>
              </div>

              <div className={styles.profileHeader}>
                <div className={styles.avatarCircle}>
                  {user ? user.fullName.charAt(0).toUpperCase() : "A"}
                </div>
                <div className={styles.avatarActions}>
                  <button className={styles.btnSecondary}>Upload photo</button>
                  <button className={styles.btnDanger}>Remove</button>
                </div>
              </div>

              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Full name</label>
                  <input 
                    type="text" 
                    className={styles.formInput} 
                    defaultValue={user?.fullName || ""} 
                    placeholder="e.g. Damian X"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Phone number</label>
                  <input 
                    type="text" 
                    className={styles.formInput} 
                    defaultValue={user?.phone || ""} 
                    placeholder="e.g. 0241234567"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Role</label>
                  <input 
                    type="text" 
                    className={styles.formInput} 
                    defaultValue={user?.role === "admin" ? "Super Admin" : user?.role === "manager" ? "Manager" : user?.role === "support" ? "Support Staff" : "User"} 
                    disabled
                  />
                </div>
              </div>

              <div>
                <button className={styles.btnPrimary}>Save changes</button>
              </div>

              <div style={{ height: '1px', backgroundColor: 'var(--border-primary)', margin: '24px 0' }} />

              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Password</h2>
                <p className={styles.sectionSubtitle}>Update your password to stay secure.</p>
              </div>
              
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Current password</label>
                  <input type="password" className={styles.formInput} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>New password</label>
                  <input type="password" className={styles.formInput} />
                </div>
              </div>

              <div>
                <button className={styles.btnPrimary}>Update password</button>
              </div>
            </div>
          )}

          {activeTab === "store" && (
            <div className={styles.sectionGroup}>
              <div className={styles.sectionHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 className={styles.sectionTitle}>Store details</h2>
                  <p className={styles.sectionSubtitle}>Configure your store's public facing information.</p>
                </div>
                <button className={styles.btnPrimary} onClick={handleSaveSettings} disabled={isSaving}>
                  {isSaving ? <Loader2 size={16} className="animate-spin" /> : "Save changes"}
                </button>
              </div>

              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Store name</label>
                  <input type="text" className={styles.formInput} value={settings.storeName} onChange={(e) => handleUpdateSetting('storeName', e.target.value)} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Support email</label>
                  <input type="email" className={styles.formInput} value={settings.supportEmail} onChange={(e) => handleUpdateSetting('supportEmail', e.target.value)} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Contact phone</label>
                  <input type="text" className={styles.formInput} value={settings.contactPhone} onChange={(e) => handleUpdateSetting('contactPhone', e.target.value)} />
                </div>
              </div>

              <div className={styles.formGroup} style={{ maxWidth: '600px' }}>
                <label className={styles.formLabel}>Physical address</label>
                <textarea 
                  className={styles.formInput} 
                  value={settings.physicalAddress}
                  onChange={(e) => handleUpdateSetting('physicalAddress', e.target.value)}
                  placeholder="Full physical address for invoices"
                ></textarea>
              </div>
            </div>
          )}

          {activeTab === "shipping" && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <h2 className={styles.sectionTitle} style={{ margin: 0 }}>Shipping & Delivery</h2>
                <button className={styles.btnPrimary} onClick={handleSaveSettings} disabled={isSaving}>
                  {isSaving ? <Loader2 size={16} className="animate-spin" /> : "Save Settings"}
                </button>
              </div>
              <p className={styles.sectionSubtitle}>Setup your delivery zones, rates, and pickup options.</p>

              <div className={styles.settingsBlock}>
                <div 
                  onClick={() => toggleSection('general')}
                  style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: expandedSections.general ? '16px' : '0' }}
                >
                  <h3 className={styles.blockTitle} style={{ margin: 0 }}>General Options</h3>
                  {expandedSections.general ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>
                
                {expandedSections.general && (
                  <div style={{ marginTop: '16px' }}>
                    <div className={styles.checkboxGroup}>
                      <input 
                        type="checkbox" 
                        id="localPickup" 
                        className={styles.checkboxInput} 
                        checked={settings.isLocalPickupEnabled}
                        onChange={(e) => handleUpdateSetting('isLocalPickupEnabled', e.target.checked)}
                      />
                      <label htmlFor="localPickup" className={styles.checkboxLabel}>
                        <strong>Enable Local Pickup</strong>
                        <span className={styles.helpText}>Allow customers to pick up their orders from your physical store for free.</span>
                      </label>
                    </div>

                    {settings.isLocalPickupEnabled && (
                      <div style={{ marginTop: '24px', paddingLeft: '30px', borderLeft: '2px solid var(--border-primary)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                          <h4 style={{ margin: 0, fontSize: '14px', color: 'var(--text-primary)' }}>Pickup Locations</h4>
                          <button 
                            className={styles.btnSecondary} 
                            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 10px', fontSize: '12px' }}
                            onClick={() => {
                              const newLoc = { id: Date.now().toString(), name: "New Location", address: "New Address" };
                              handleUpdateSetting('pickupLocations', [...settings.pickupLocations, newLoc]);
                            }}
                          >
                            <Plus size={14} /> Add Location
                          </button>
                        </div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          {settings.pickupLocations.map((loc: any, i: number) => (
                            <div key={loc.id} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                              <div style={{ flex: 1 }}>
                                <input 
                                  type="text" 
                                  className={styles.formInput} 
                                  value={loc.name} 
                                  onChange={(e) => {
                                    const newLocs = [...settings.pickupLocations];
                                    newLocs[i].name = e.target.value;
                                    handleUpdateSetting('pickupLocations', newLocs);
                                  }}
                                  placeholder="Location Name" 
                                  style={{ marginBottom: '8px' }} 
                                />
                                <input 
                                  type="text" 
                                  className={styles.formInput} 
                                  value={loc.address} 
                                  onChange={(e) => {
                                    const newLocs = [...settings.pickupLocations];
                                    newLocs[i].address = e.target.value;
                                    handleUpdateSetting('pickupLocations', newLocs);
                                  }}
                                  placeholder="Full Address" 
                                />
                              </div>
                              <button 
                                className={styles.iconBtnDanger} 
                                aria-label="Delete Location" 
                                style={{ marginTop: '4px' }}
                                onClick={() => {
                                  handleUpdateSetting('pickupLocations', settings.pickupLocations.filter((l: any) => l.id !== loc.id));
                                }}
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className={styles.formGroup} style={{ marginTop: '32px' }}>
                      <label className={styles.formLabel}>Free Delivery Threshold (₵)</label>
                      <input 
                        type="number" 
                        className={styles.formInput} 
                        value={settings.freeDeliveryThreshold} 
                        onChange={(e) => handleUpdateSetting('freeDeliveryThreshold', Number(e.target.value))}
                        placeholder="e.g. 5000" 
                      />
                      <span className={styles.helpText} style={{ display: 'block', marginTop: '6px' }}>Orders above this amount will automatically qualify for free shipping. Leave blank or 0 to disable.</span>
                    </div>
                  </div>
                )}
              </div>

              <div className={styles.divider}></div>

              <div className={styles.settingsBlock}>
                <div 
                  onClick={() => toggleSection('zones')}
                  style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: expandedSections.zones ? '16px' : '0' }}
                >
                  <h3 className={styles.blockTitle} style={{ margin: 0 }}>Delivery Zones</h3>
                  {expandedSections.zones ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>

                {expandedSections.zones && (
                  <div style={{ marginTop: '16px' }}>
                    <div className={styles.checkboxGroup} style={{ marginBottom: '24px' }}>
                      <input 
                        type="checkbox" 
                        id="homeDelivery" 
                        className={styles.checkboxInput} 
                        checked={settings.isDeliveryEnabled}
                        onChange={(e) => handleUpdateSetting('isDeliveryEnabled', e.target.checked)}
                      />
                      <label htmlFor="homeDelivery" className={styles.checkboxLabel}>
                        <strong>Enable Home Delivery</strong>
                        <span className={styles.helpText}>Allow customers to have orders delivered to their address.</span>
                      </label>
                    </div>

                    {settings.isDeliveryEnabled && (
                      <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                          <h4 style={{ margin: 0, fontSize: '14px', color: 'var(--text-primary)' }}>Configured Zones</h4>
                          <button 
                            className={styles.btnSecondary} 
                            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px' }}
                            onClick={() => {
                              const newZone = { id: Date.now().toString(), name: "New Zone", time: "1-2 Days", rate: 0 };
                              handleUpdateSetting('deliveryZones', [...settings.deliveryZones, newZone]);
                            }}
                          >
                            <Plus size={16} /> Add Zone
                          </button>
                        </div>
                        
                        <div className={styles.zonesContainer}>
                          {settings.deliveryZones.map((zone: any, i: number) => (
                            <div key={zone.id} className={styles.zoneRow}>
                              <div className={styles.zoneGrid}>
                                <div className={styles.formGroup} style={{ marginBottom: 0 }}>
                                  <label className={styles.formLabel} style={{ fontSize: '12px' }}>Zone Name</label>
                                  <input 
                                    type="text" 
                                    className={styles.formInput} 
                                    value={zone.name} 
                                    onChange={(e) => {
                                      const newZones = [...settings.deliveryZones];
                                      newZones[i].name = e.target.value;
                                      handleUpdateSetting('deliveryZones', newZones);
                                    }}
                                  />
                                </div>
                                <div className={styles.formGroup} style={{ marginBottom: 0 }}>
                                  <label className={styles.formLabel} style={{ fontSize: '12px' }}>Est. Delivery Time</label>
                                  <input 
                                    type="text" 
                                    className={styles.formInput} 
                                    value={zone.time} 
                                    onChange={(e) => {
                                      const newZones = [...settings.deliveryZones];
                                      newZones[i].time = e.target.value;
                                      handleUpdateSetting('deliveryZones', newZones);
                                    }}
                                  />
                                </div>
                                <div className={styles.formGroup} style={{ marginBottom: 0 }}>
                                  <label className={styles.formLabel} style={{ fontSize: '12px' }}>Flat Rate (₵)</label>
                                  <input 
                                    type="number" 
                                    className={styles.formInput} 
                                    value={zone.rate} 
                                    onChange={(e) => {
                                      const newZones = [...settings.deliveryZones];
                                      newZones[i].rate = Number(e.target.value);
                                      handleUpdateSetting('deliveryZones', newZones);
                                    }}
                                  />
                                </div>
                              </div>
                              <button 
                                className={styles.iconBtnDanger} 
                                aria-label="Delete Zone"
                                onClick={() => {
                                  handleUpdateSetting('deliveryZones', settings.deliveryZones.filter((z: any) => z.id !== zone.id));
                                }}
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <h2 className={styles.sectionTitle} style={{ margin: 0 }}>Notifications & Alerts</h2>
                <button className={styles.btnPrimary} onClick={handleSaveSettings} disabled={isSaving}>
                  {isSaving ? <Loader2 size={16} className="animate-spin" /> : "Save Settings"}
                </button>
              </div>
              <p className={styles.sectionSubtitle}>Manage automated emails and system alerts for both admins and customers.</p>

              <div className={styles.settingsBlock}>
                <div 
                  onClick={() => toggleSection('adminAlerts')}
                  style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: expandedSections.adminAlerts ? '16px' : '0' }}
                >
                  <h3 className={styles.blockTitle} style={{ margin: 0 }}>Admin Alerts</h3>
                  {expandedSections.adminAlerts ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>
                
                {expandedSections.adminAlerts && (
                  <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div className={styles.checkboxGroup}>
                      <input 
                        type="checkbox" 
                        id="alertNewOrder" 
                        className={styles.checkboxInput} 
                        checked={settings.adminAlertNewOrder}
                        onChange={(e) => handleUpdateSetting('adminAlertNewOrder', e.target.checked)}
                      />
                      <label htmlFor="alertNewOrder" className={styles.checkboxLabel}>
                        <strong>New Order Received</strong>
                        <span className={styles.helpText}>Get an email instantly when a customer places a new order.</span>
                      </label>
                    </div>

                    <div className={styles.checkboxGroup}>
                      <input 
                        type="checkbox" 
                        id="alertNewUser" 
                        className={styles.checkboxInput} 
                        checked={settings.adminAlertNewUser}
                        onChange={(e) => handleUpdateSetting('adminAlertNewUser', e.target.checked)}
                      />
                      <label htmlFor="alertNewUser" className={styles.checkboxLabel}>
                        <strong>New Customer Sign-up</strong>
                        <span className={styles.helpText}>Get notified when a new user registers an account on your store.</span>
                      </label>
                    </div>

                    <div className={styles.checkboxGroup}>
                      <input 
                        type="checkbox" 
                        id="alertLowStock" 
                        className={styles.checkboxInput} 
                        checked={settings.adminAlertLowStock}
                        onChange={(e) => handleUpdateSetting('adminAlertLowStock', e.target.checked)}
                      />
                      <label htmlFor="alertLowStock" className={styles.checkboxLabel}>
                        <strong>Low Stock Warnings</strong>
                        <span className={styles.helpText}>Receive alerts when product inventory falls below a specific threshold.</span>
                      </label>
                    </div>

                    {settings.adminAlertLowStock && (
                      <div className={styles.formGroup} style={{ marginTop: '8px', paddingLeft: '30px', borderLeft: '2px solid var(--border-primary)' }}>
                        <label className={styles.formLabel}>Low Stock Threshold</label>
                        <input 
                          type="number" 
                          className={styles.formInput} 
                          value={settings.lowStockThreshold} 
                          onChange={(e) => handleUpdateSetting('lowStockThreshold', Number(e.target.value))}
                          placeholder="e.g. 5" 
                          style={{ maxWidth: '150px' }} 
                        />
                        <span className={styles.helpText} style={{ display: 'block', marginTop: '6px' }}>Alert when stock is equal to or less than this number.</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className={styles.divider}></div>

              <div className={styles.settingsBlock}>
                <div 
                  onClick={() => toggleSection('customerAlerts')}
                  style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: expandedSections.customerAlerts ? '16px' : '0' }}
                >
                  <h3 className={styles.blockTitle} style={{ margin: 0 }}>Customer Emails</h3>
                  {expandedSections.customerAlerts ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>
                
                {expandedSections.customerAlerts && (
                  <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div className={styles.checkboxGroup}>
                      <input 
                        type="checkbox" 
                        id="emailOrderConfirm" 
                        className={styles.checkboxInput} 
                        checked={settings.customerEmailOrderConfirm}
                        onChange={(e) => handleUpdateSetting('customerEmailOrderConfirm', e.target.checked)}
                      />
                      <label htmlFor="emailOrderConfirm" className={styles.checkboxLabel}>
                        <strong>Order Confirmation</strong>
                        <span className={styles.helpText}>Automatically email a receipt to the customer when they checkout.</span>
                      </label>
                    </div>

                    <div className={styles.checkboxGroup}>
                      <input 
                        type="checkbox" 
                        id="emailOrderShipped" 
                        className={styles.checkboxInput} 
                        checked={settings.customerEmailOrderShipped}
                        onChange={(e) => handleUpdateSetting('customerEmailOrderShipped', e.target.checked)}
                      />
                      <label htmlFor="emailOrderShipped" className={styles.checkboxLabel}>
                        <strong>Order Shipped</strong>
                        <span className={styles.helpText}>Send a notification when you mark their order status as "Shipped".</span>
                      </label>
                    </div>

                    <div className={styles.checkboxGroup}>
                      <input 
                        type="checkbox" 
                        id="emailReview" 
                        className={styles.checkboxInput} 
                        checked={settings.customerEmailReview}
                        onChange={(e) => handleUpdateSetting('customerEmailReview', e.target.checked)}
                      />
                      <label htmlFor="emailReview" className={styles.checkboxLabel}>
                        <strong>Review Request</strong>
                        <span className={styles.helpText}>Automatically ask for a review 7 days after the order is delivered.</span>
                      </label>
                    </div>

                    <div className={styles.checkboxGroup}>
                      <input 
                        type="checkbox" 
                        id="emailWelcome" 
                        className={styles.checkboxInput} 
                        checked={settings.customerEmailWelcome}
                        onChange={(e) => handleUpdateSetting('customerEmailWelcome', e.target.checked)}
                      />
                      <label htmlFor="emailWelcome" className={styles.checkboxLabel}>
                        <strong>Welcome Email</strong>
                        <span className={styles.helpText}>Send a customized welcome message when a new user registers.</span>
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <h2 className={styles.sectionTitle} style={{ margin: 0 }}>Team & Security</h2>
                <button className={styles.btnPrimary} onClick={handleSaveSettings} disabled={isSaving}>
                  {isSaving ? <Loader2 size={16} className="animate-spin" /> : "Save Settings"}
                </button>
              </div>
              <p className={styles.sectionSubtitle}>Manage your team members, roles, and global security policies.</p>

              <div className={styles.settingsBlock}>
                <div 
                  onClick={() => toggleSection('teamMembers')}
                  style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: expandedSections.teamMembers ? '16px' : '0' }}
                >
                  <h3 className={styles.blockTitle} style={{ margin: 0 }}>Team Members</h3>
                  {expandedSections.teamMembers ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>
                
                {expandedSections.teamMembers && (
                  <div style={{ marginTop: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <p className={styles.helpText} style={{ margin: 0 }}>Invite colleagues to help manage your store. Assign roles to restrict access.</p>
                      <button 
                        className={styles.btnSecondary} 
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px' }}
                        onClick={() => setIsInviteModalOpen(true)}
                      >
                        <Plus size={16} /> Invite Member
                      </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {teamMembers.map(member => (
                        <div key={member._id} className={styles.zoneRow} style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
                            <div className={styles.avatarCircle} style={{ width: '40px', height: '40px', fontSize: '16px' }}>
                              {member.fullName.charAt(0).toUpperCase()}
                            </div>
                            <div style={{ flex: 1 }}>
                              <p style={{ margin: 0, fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)' }}>
                                {member.fullName} {user && user._id === member._id && <span style={{ fontSize: '12px', color: 'var(--primary-color)', fontWeight: 'normal' }}>(You)</span>}
                              </p>
                              <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>{member.email || member.phone}</p>
                            </div>
                            <div style={{ width: '150px' }}>
                              <select 
                                className={styles.formInput} 
                                value={member.role} 
                                disabled={user && user._id === member._id} 
                                style={{ padding: '8px 12px' }}
                                onChange={() => {}} // Could implement change role logic here later
                              >
                                <option value="admin">Super Admin</option>
                                <option value="manager">Manager</option>
                                <option value="support">Support Staff</option>
                              </select>
                            </div>
                          </div>
                          {(!user || user._id !== member._id) && (
                            <button className={styles.iconBtnDanger} aria-label="Remove Member" style={{ marginTop: 0 }} onClick={() => handleRemoveTeamMember(member._id)}>
                              <Trash2 size={18} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className={styles.divider}></div>

              <div className={styles.settingsBlock}>
                <div 
                  onClick={() => toggleSection('security')}
                  style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: expandedSections.security ? '16px' : '0' }}
                >
                  <h3 className={styles.blockTitle} style={{ margin: 0 }}>Global Security Policies</h3>
                  {expandedSections.security ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>

                {expandedSections.security && (
                  <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div className={styles.checkboxGroup}>
                      <input 
                        type="checkbox" 
                        id="require2FA" 
                        className={styles.checkboxInput} 
                        checked={settings.require2FA}
                        onChange={(e) => handleUpdateSetting('require2FA', e.target.checked)}
                      />
                      <label htmlFor="require2FA" className={styles.checkboxLabel}>
                        <strong>Require Two-Factor Authentication (2FA)</strong>
                        <span className={styles.helpText}>Force all staff members to use an authenticator app to log in. Highly recommended.</span>
                      </label>
                    </div>

                    <div className={styles.checkboxGroup}>
                      <input 
                        type="checkbox" 
                        id="sessionTimeout" 
                        className={styles.checkboxInput} 
                        checked={settings.sessionTimeout}
                        onChange={(e) => handleUpdateSetting('sessionTimeout', e.target.checked)}
                      />
                      <label htmlFor="sessionTimeout" className={styles.checkboxLabel}>
                        <strong>Strict Session Timeout</strong>
                        <span className={styles.helpText}>Automatically log out inactive admins after 30 minutes of no activity.</span>
                      </label>
                    </div>

                    <div style={{ paddingLeft: '30px', marginTop: '8px' }}>
                      <button className={styles.btnSecondary} style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)' }}>
                        Force Logout All Devices
                      </button>
                      <span className={styles.helpText} style={{ display: 'block', marginTop: '8px' }}>
                        This will instantly log out every active session across all devices, except your current one.
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {["payments"].includes(activeTab) && (
            <div className={styles.comingSoon}>
              <ImageIcon size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
              <h2 className={styles.sectionTitle}>Coming Soon</h2>
              <p className={styles.sectionSubtitle}>This module is currently under development.</p>
            </div>
          )}
        </main>
      </div>

      {/* Invite Member Modal */}
      {isInviteModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'var(--card-bg)', width: '100%', maxWidth: '450px', borderRadius: '12px', padding: '24px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', border: '1px solid var(--border-primary)', position: 'relative' }}>
            <button 
              onClick={() => setIsInviteModalOpen(false)}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
            >
              <X size={20} />
            </button>
            <h2 className={styles.sectionTitle} style={{ margin: '0 0 8px 0' }}>Invite Team Member</h2>
            <p className={styles.sectionSubtitle} style={{ marginBottom: '24px' }}>Send an invitation link via WhatsApp with an OTP.</p>

            <form onSubmit={handleInvite} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className={styles.formGroup} style={{ marginBottom: 0 }}>
                <label className={styles.formLabel}>Full Name</label>
                <input 
                  type="text" 
                  required 
                  className={styles.formInput} 
                  placeholder="e.g. John Doe"
                  value={inviteData.fullName}
                  onChange={(e) => setInviteData({...inviteData, fullName: e.target.value})}
                />
              </div>

              <div className={styles.formGroup} style={{ marginBottom: 0 }}>
                <label className={styles.formLabel}>Phone Number (WhatsApp)</label>
                <input 
                  type="tel" 
                  required 
                  className={styles.formInput} 
                  placeholder="e.g. 0241234567"
                  value={inviteData.phone}
                  onChange={(e) => setInviteData({...inviteData, phone: e.target.value})}
                />
              </div>

              <div className={styles.formGroup} style={{ marginBottom: 0 }}>
                <label className={styles.formLabel}>Role</label>
                <select 
                  className={styles.formInput} 
                  value={inviteData.role}
                  onChange={(e) => setInviteData({...inviteData, role: e.target.value})}
                >
                  <option value="manager">Manager</option>
                  <option value="support">Support Staff</option>
                  <option value="admin">Super Admin</option>
                </select>
              </div>

              {inviteError && <div style={{ color: '#ef4444', fontSize: '13px', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '8px', borderRadius: '4px' }}>{inviteError}</div>}
              {inviteSuccess && <div style={{ color: '#10b981', fontSize: '13px', backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '8px', borderRadius: '4px' }}>{inviteSuccess}</div>}

              <button type="submit" className={styles.btnPrimary} disabled={isInviting} style={{ marginTop: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                {isInviting ? <><Loader2 size={18} className="animate-spin" /> Sending...</> : "Send WhatsApp Invitation"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
