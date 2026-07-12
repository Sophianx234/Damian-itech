"use client";

import React, { useState, useEffect, useRef } from "react";
import { User, Store, CreditCard, Truck, BellRing, Shield, Zap, Image as ImageIcon, Trash2, Plus, X, Loader2 } from "lucide-react";
import styles from "./Settings.module.css";

type Tab = "profile" | "store" | "payments" | "shipping" | "notifications" | "security" | "flashsale";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [user, setUser] = useState<{ _id: string; fullName: string; email: string; role: string; phone: string } | null>(null);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  
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
    flashSaleActive: true,
    flashSaleTitle: "Sony WH-1000XM5 Wireless Noise Canceling",
    flashSaleDescription: "Industry-leading noise cancellation. Two processors control 8 microphones for unprecedented noise cancellation.",
    flashSaleImage: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=1000&auto=format&fit=crop",
    flashSaleNewPrice: 298.00,
    flashSaleOldPrice: 398.00,
    flashSaleEndTime: new Date(new Date().getTime() + (14 * 60 * 60 * 1000) + (45 * 60 * 1000)).toISOString().slice(0, 16),
    flashSaleLink: "/products/sony-wh-1000xm5"
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteData, setInviteData] = useState({ fullName: "", phone: "", role: "manager" });
  const [isInviting, setIsInviting] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null);

  const [products, setProducts] = useState<any[]>([]);
  const [pendingImage, setPendingImage] = useState<File | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setUser(data.user);
      })
      .catch((err) => console.error("Failed to fetch session", err));

    fetch("/api/admin/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.settings) {
          setSettings(data.settings);
        }
      })
      .catch((err) => console.error("Failed to fetch settings", err));

    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setProducts(data.data);
        }
      })
      .catch((err) => console.error("Failed to fetch products", err));

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
    setSettings((prev: any) => ({ ...prev, [key]: value }));
  };

  const handleProductSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const slug = e.target.value;
    if (!slug) return;
    const selected = products.find(p => p.slug === slug);
    if (selected) {
      handleUpdateSetting('flashSaleLink', `/products/${selected.slug}`);
      handleUpdateSetting('flashSaleTitle', selected.title);
      handleUpdateSetting('flashSaleDescription', selected.description || '');
      handleUpdateSetting('flashSaleOldPrice', selected.oldPrice || selected.price);
      handleUpdateSetting('flashSaleNewPrice', selected.price);
      if (selected.images && selected.images.length > 0) {
        handleUpdateSetting('flashSaleImage', selected.images[0]);
        setPendingImage(null); // Clear any pending local image upload
      }
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    setPendingImage(file);
    const objectUrl = URL.createObjectURL(file);
    handleUpdateSetting('flashSaleImage', objectUrl);
    if (imageInputRef.current) imageInputRef.current.value = '';
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    setSaveMessage(null);
    try {
      let finalSettings = { ...settings };

      if (pendingImage) {
        const signRes = await fetch("/api/cloudinary/sign");
        if (!signRes.ok) throw new Error("Failed to get upload signature");
        const { timestamp, signature, apiKey, cloudName, folder } = await signRes.json();

        const uploadData = new FormData();
        uploadData.append("file", pendingImage);
        uploadData.append("api_key", apiKey);
        uploadData.append("timestamp", timestamp);
        uploadData.append("signature", signature);
        uploadData.append("folder", folder);

        const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: "POST",
          body: uploadData,
        });
        
        if (!uploadRes.ok) throw new Error("Failed to upload image to Cloudinary");
        const cloudinaryData = await uploadRes.json();
        finalSettings.flashSaleImage = cloudinaryData.secure_url;
      }

      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalSettings),
      });
      const data = await res.json();
      if (data.success) {
        setSettings(finalSettings);
        setPendingImage(null);
        setSaveMessage({ type: 'success', text: 'Settings saved successfully' });
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
        fetchTeamMembers(); 
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to remove team member");
    }
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "store", label: "Store details", icon: Store },
    { id: "flashsale", label: "Flash Sale Popup", icon: Zap },
    { id: "payments", label: "Payments", icon: CreditCard },
    { id: "shipping", label: "Shipping", icon: Truck },
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

          {activeTab === "flashsale" && (
            <div className={styles.sectionGroup}>
              <div className={styles.sectionHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 className={styles.sectionTitle}>Flash Sale Popup</h2>
                  <p className={styles.sectionSubtitle}>Manage the first-visit global deal popup.</p>
                </div>
                <button className={styles.btnPrimary} onClick={handleSaveSettings} disabled={isSaving}>
                  {isSaving ? <Loader2 size={16} className="animate-spin" /> : "Save changes"}
                </button>
              </div>

              <div className={styles.toggleGroup}>
                <div className={styles.toggleInfo}>
                  <span className={styles.toggleLabel}>Enable Flash Sale</span>
                  <span className={styles.toggleDesc}>Show the flash sale popup to new visitors</span>
                </div>
                <label className={styles.switch}>
                  <input 
                    type="checkbox" 
                    checked={settings.flashSaleActive}
                    onChange={(e) => handleUpdateSetting('flashSaleActive', e.target.checked)}
                  />
                  <span className={styles.slider}></span>
                </label>
              </div>

              {settings.flashSaleActive && (
                <>
                  <div className={styles.formGrid}>
                    <div className={styles.formGroup} style={{ gridColumn: '1 / -1', background: 'var(--bg-secondary)', padding: '16px', borderRadius: '8px' }}>
                      <label className={styles.formLabel}>Quick Select from Existing Products</label>
                      <select 
                        className={styles.formInput} 
                        onChange={handleProductSelect}
                        defaultValue=""
                      >
                        <option value="" disabled>-- Select a product to autofill fields --</option>
                        {products.map(p => (
                          <option key={p._id} value={p.slug}>{p.title} (${p.price})</option>
                        ))}
                      </select>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                        Selecting a product will automatically fill the title, description, image, prices, and link below.
                      </p>
                    </div>

                    <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                      <label className={styles.formLabel}>Deal Title</label>
                      <input type="text" className={styles.formInput} value={settings.flashSaleTitle} onChange={(e) => handleUpdateSetting('flashSaleTitle', e.target.value)} />
                    </div>
                    <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                      <label className={styles.formLabel}>Description</label>
                      <textarea className={styles.formInput} value={settings.flashSaleDescription} onChange={(e) => handleUpdateSetting('flashSaleDescription', e.target.value)} rows={3} />
                    </div>
                    
                    <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                      <label className={styles.formLabel}>Image Source</label>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '12px' }}>
                        <input 
                          type="text" 
                          className={styles.formInput} 
                          value={settings.flashSaleImage} 
                          onChange={(e) => handleUpdateSetting('flashSaleImage', e.target.value)} 
                          placeholder="https://" 
                          style={{ flex: 1 }}
                        />
                        <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>OR</span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          ref={imageInputRef}
                          style={{ display: 'none' }}
                          onChange={handleImageSelect}
                        />
                        <button 
                          type="button"
                          className={styles.btnSecondary} 
                          onClick={() => imageInputRef.current?.click()}
                          disabled={isSaving}
                          style={{ whiteSpace: 'nowrap' }}
                        >
                          <ImageIcon size={16} /> Select Local Image
                        </button>
                      </div>
                      {settings.flashSaleImage && (
                        <div style={{ width: '100px', height: '100px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-primary)' }}>
                          <img src={settings.flashSaleImage} alt="Flash Sale" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                      )}
                      {pendingImage && (
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                          Image selected but not uploaded yet. Click "Save changes" above to upload and save.
                        </p>
                      )}
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>End Date & Time</label>
                      <input type="datetime-local" className={styles.formInput} value={settings.flashSaleEndTime} onChange={(e) => handleUpdateSetting('flashSaleEndTime', e.target.value)} />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Target Product Link</label>
                      <input type="text" className={styles.formInput} value={settings.flashSaleLink} onChange={(e) => handleUpdateSetting('flashSaleLink', e.target.value)} placeholder="/products/..." />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>New Deal Price ($)</label>
                      <input type="number" step="0.01" className={styles.formInput} value={settings.flashSaleNewPrice} onChange={(e) => handleUpdateSetting('flashSaleNewPrice', parseFloat(e.target.value))} />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Original Price ($)</label>
                      <input type="number" step="0.01" className={styles.formInput} value={settings.flashSaleOldPrice} onChange={(e) => handleUpdateSetting('flashSaleOldPrice', parseFloat(e.target.value))} />
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === "shipping" && (
            <div className={styles.sectionGroup}>
              <div className={styles.sectionHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 className={styles.sectionTitle}>Shipping</h2>
                  <p className={styles.sectionSubtitle}>Set up delivery zones, rates, and pickup options.</p>
                </div>
                <button className={styles.btnPrimary} onClick={handleSaveSettings} disabled={isSaving}>
                  {isSaving ? <Loader2 size={16} className="animate-spin" /> : "Save changes"}
                </button>
              </div>

              <div className={styles.toggleGroup}>
                <div className={styles.toggleInfo}>
                  <span className={styles.toggleLabel}>Local pickup</span>
                  <span className={styles.toggleDesc}>Allow customers to pick up orders from physical locations</span>
                </div>
                <label className={styles.switch}>
                  <input 
                    type="checkbox" 
                    checked={settings.isLocalPickupEnabled}
                    onChange={(e) => handleUpdateSetting('isLocalPickupEnabled', e.target.checked)}
                  />
                  <span className={styles.slider}></span>
                </label>
              </div>

              {settings.isLocalPickupEnabled && (
                <div className={styles.listContainer}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>Locations</span>
                    <button 
                      className={styles.btnSecondary} 
                      onClick={() => handleUpdateSetting('pickupLocations', [...settings.pickupLocations, { id: Date.now().toString(), name: "New Location", address: "" }])}
                    >
                      <Plus size={16} /> Add location
                    </button>
                  </div>
                  {settings.pickupLocations.map((loc: any, i: number) => (
                    <div key={loc.id} className={styles.listItem}>
                      <div className={styles.listItemContent} style={{ flexWrap: 'wrap' }}>
                        <input 
                          type="text" 
                          className={styles.formInput} 
                          value={loc.name} 
                          onChange={(e) => {
                            const newLocs = [...settings.pickupLocations];
                            newLocs[i].name = e.target.value;
                            handleUpdateSetting('pickupLocations', newLocs);
                          }}
                          placeholder="Location name" 
                          style={{ flex: 1, minWidth: '200px' }}
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
                          placeholder="Full address" 
                          style={{ flex: 2, minWidth: '300px' }}
                        />
                      </div>
                      <button 
                        className={styles.iconBtnDanger} 
                        onClick={() => handleUpdateSetting('pickupLocations', settings.pickupLocations.filter((l: any) => l.id !== loc.id))}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ height: '1px', backgroundColor: 'var(--border-primary)', margin: '16px 0' }} />

              <div className={styles.toggleGroup}>
                <div className={styles.toggleInfo}>
                  <span className={styles.toggleLabel}>Home delivery</span>
                  <span className={styles.toggleDesc}>Allow customers to have orders delivered to their address</span>
                </div>
                <label className={styles.switch}>
                  <input 
                    type="checkbox" 
                    checked={settings.isDeliveryEnabled}
                    onChange={(e) => handleUpdateSetting('isDeliveryEnabled', e.target.checked)}
                  />
                  <span className={styles.slider}></span>
                </label>
              </div>

              {settings.isDeliveryEnabled && (
                <div className={styles.listContainer}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>Delivery zones</span>
                    <button 
                      className={styles.btnSecondary} 
                      onClick={() => handleUpdateSetting('deliveryZones', [...settings.deliveryZones, { id: Date.now().toString(), name: "New Zone", time: "1-2 Days", rate: 0 }])}
                    >
                      <Plus size={16} /> Add zone
                    </button>
                  </div>
                  {settings.deliveryZones.map((zone: any, i: number) => (
                    <div key={zone.id} className={styles.listItem}>
                      <div className={styles.listItemContent} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', width: '100%' }}>
                        <div className={styles.formGroup}>
                          <label className={styles.formLabel}>Zone name</label>
                          <input 
                            type="text" className={styles.formInput} value={zone.name} 
                            onChange={(e) => {
                              const newZones = [...settings.deliveryZones];
                              newZones[i].name = e.target.value;
                              handleUpdateSetting('deliveryZones', newZones);
                            }}
                          />
                        </div>
                        <div className={styles.formGroup}>
                          <label className={styles.formLabel}>Delivery time</label>
                          <input 
                            type="text" className={styles.formInput} value={zone.time} 
                            onChange={(e) => {
                              const newZones = [...settings.deliveryZones];
                              newZones[i].time = e.target.value;
                              handleUpdateSetting('deliveryZones', newZones);
                            }}
                          />
                        </div>
                        <div className={styles.formGroup}>
                          <label className={styles.formLabel}>Flat rate (₵)</label>
                          <input 
                            type="number" className={styles.formInput} value={zone.rate} 
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
                        onClick={() => handleUpdateSetting('deliveryZones', settings.deliveryZones.filter((z: any) => z.id !== zone.id))}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                  
                  <div className={styles.formGroup} style={{ marginTop: '24px', maxWidth: '300px' }}>
                    <label className={styles.formLabel}>Free delivery threshold (₵)</label>
                    <input 
                      type="number" className={styles.formInput} 
                      value={settings.freeDeliveryThreshold} 
                      onChange={(e) => handleUpdateSetting('freeDeliveryThreshold', Number(e.target.value))}
                      placeholder="e.g. 5000" 
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "notifications" && (
            <div className={styles.sectionGroup}>
              <div className={styles.sectionHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 className={styles.sectionTitle}>Notifications</h2>
                  <p className={styles.sectionSubtitle}>Manage automated emails and system alerts.</p>
                </div>
                <button className={styles.btnPrimary} onClick={handleSaveSettings} disabled={isSaving}>
                  {isSaving ? <Loader2 size={16} className="animate-spin" /> : "Save changes"}
                </button>
              </div>

              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px' }}>Admin Alerts</h3>
                <div className={styles.toggleGroup}>
                  <div className={styles.toggleInfo}>
                    <span className={styles.toggleLabel}>New order received</span>
                    <span className={styles.toggleDesc}>Receive an email when a customer places an order</span>
                  </div>
                  <label className={styles.switch}>
                    <input type="checkbox" checked={settings.adminAlertNewOrder} onChange={(e) => handleUpdateSetting('adminAlertNewOrder', e.target.checked)} />
                    <span className={styles.slider}></span>
                  </label>
                </div>
                <div className={styles.toggleGroup}>
                  <div className={styles.toggleInfo}>
                    <span className={styles.toggleLabel}>New customer sign-up</span>
                    <span className={styles.toggleDesc}>Get notified when a new user registers</span>
                  </div>
                  <label className={styles.switch}>
                    <input type="checkbox" checked={settings.adminAlertNewUser} onChange={(e) => handleUpdateSetting('adminAlertNewUser', e.target.checked)} />
                    <span className={styles.slider}></span>
                  </label>
                </div>
                <div className={styles.toggleGroup}>
                  <div className={styles.toggleInfo}>
                    <span className={styles.toggleLabel}>Low stock warnings</span>
                    <span className={styles.toggleDesc}>Receive alerts when product inventory falls below threshold</span>
                  </div>
                  <label className={styles.switch}>
                    <input type="checkbox" checked={settings.adminAlertLowStock} onChange={(e) => handleUpdateSetting('adminAlertLowStock', e.target.checked)} />
                    <span className={styles.slider}></span>
                  </label>
                </div>
                {settings.adminAlertLowStock && (
                  <div className={styles.formGroup} style={{ marginTop: '16px', maxWidth: '200px' }}>
                    <label className={styles.formLabel}>Low stock threshold</label>
                    <input 
                      type="number" className={styles.formInput} 
                      value={settings.lowStockThreshold} 
                      onChange={(e) => handleUpdateSetting('lowStockThreshold', Number(e.target.value))}
                    />
                  </div>
                )}
              </div>

              <div style={{ height: '1px', backgroundColor: 'var(--border-primary)', margin: '16px 0' }} />

              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px' }}>Customer Emails</h3>
                <div className={styles.toggleGroup}>
                  <div className={styles.toggleInfo}>
                    <span className={styles.toggleLabel}>Order confirmation</span>
                    <span className={styles.toggleDesc}>Automatically email receipt after checkout</span>
                  </div>
                  <label className={styles.switch}>
                    <input type="checkbox" checked={settings.customerEmailOrderConfirm} onChange={(e) => handleUpdateSetting('customerEmailOrderConfirm', e.target.checked)} />
                    <span className={styles.slider}></span>
                  </label>
                </div>
                <div className={styles.toggleGroup}>
                  <div className={styles.toggleInfo}>
                    <span className={styles.toggleLabel}>Order out for delivery</span>
                    <span className={styles.toggleDesc}>Send a notification when order status is marked as out for delivery</span>
                  </div>
                  <label className={styles.switch}>
                    <input type="checkbox" checked={settings.customerEmailOrderShipped} onChange={(e) => handleUpdateSetting('customerEmailOrderShipped', e.target.checked)} />
                    <span className={styles.slider}></span>
                  </label>
                </div>
                <div className={styles.toggleGroup}>
                  <div className={styles.toggleInfo}>
                    <span className={styles.toggleLabel}>Review request</span>
                    <span className={styles.toggleDesc}>Ask for a review 7 days after delivery</span>
                  </div>
                  <label className={styles.switch}>
                    <input type="checkbox" checked={settings.customerEmailReview} onChange={(e) => handleUpdateSetting('customerEmailReview', e.target.checked)} />
                    <span className={styles.slider}></span>
                  </label>
                </div>
                <div className={styles.toggleGroup}>
                  <div className={styles.toggleInfo}>
                    <span className={styles.toggleLabel}>Welcome email</span>
                    <span className={styles.toggleDesc}>Send a message when a new user registers</span>
                  </div>
                  <label className={styles.switch}>
                    <input type="checkbox" checked={settings.customerEmailWelcome} onChange={(e) => handleUpdateSetting('customerEmailWelcome', e.target.checked)} />
                    <span className={styles.slider}></span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className={styles.sectionGroup}>
              <div className={styles.sectionHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 className={styles.sectionTitle}>Team & Security</h2>
                  <p className={styles.sectionSubtitle}>Manage team roles and global security policies.</p>
                </div>
                <button className={styles.btnPrimary} onClick={handleSaveSettings} disabled={isSaving}>
                  {isSaving ? <Loader2 size={16} className="animate-spin" /> : "Save changes"}
                </button>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Team Members</h3>
                  <button className={styles.btnSecondary} onClick={() => setIsInviteModalOpen(true)}>
                    <Plus size={16} /> Invite member
                  </button>
                </div>

                <div className={styles.listContainer}>
                  {teamMembers.map(member => (
                    <div key={member._id} className={styles.listItem}>
                      <div className={styles.listItemContent}>
                        <div className={styles.avatarCircle} style={{ width: '40px', height: '40px', fontSize: '16px' }}>
                          {member.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div style={{ flex: 1 }}>
                          <h4 className={styles.listItemTitle}>
                            {member.fullName} {user && user._id === member._id && <span style={{ color: 'var(--text-muted)', fontWeight: 'normal' }}>(You)</span>}
                          </h4>
                          <p className={styles.listItemSubtitle}>{member.email || member.phone}</p>
                        </div>
                        <div style={{ width: '160px' }}>
                          <select 
                            className={styles.formInput} 
                            value={member.role} 
                            disabled={user && user._id === member._id} 
                          >
                            <option value="admin">Super Admin</option>
                            <option value="manager">Manager</option>
                            <option value="support">Support</option>
                          </select>
                        </div>
                      </div>
                      {(!user || user._id !== member._id) && (
                        <button className={styles.iconBtnDanger} onClick={() => handleRemoveTeamMember(member._id)}>
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ height: '1px', backgroundColor: 'var(--border-primary)', margin: '16px 0' }} />

              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px' }}>Security Policies</h3>
                
                <div className={styles.toggleGroup}>
                  <div className={styles.toggleInfo}>
                    <span className={styles.toggleLabel}>Require 2FA</span>
                    <span className={styles.toggleDesc}>Force all staff to use an authenticator app</span>
                  </div>
                  <label className={styles.switch}>
                    <input type="checkbox" checked={settings.require2FA} onChange={(e) => handleUpdateSetting('require2FA', e.target.checked)} />
                    <span className={styles.slider}></span>
                  </label>
                </div>

                <div className={styles.toggleGroup}>
                  <div className={styles.toggleInfo}>
                    <span className={styles.toggleLabel}>Strict session timeout</span>
                    <span className={styles.toggleDesc}>Log out inactive admins after 30 minutes</span>
                  </div>
                  <label className={styles.switch}>
                    <input type="checkbox" checked={settings.sessionTimeout} onChange={(e) => handleUpdateSetting('sessionTimeout', e.target.checked)} />
                    <span className={styles.slider}></span>
                  </label>
                </div>

                <div style={{ marginTop: '32px' }}>
                  <button className={styles.btnDanger}>
                    Force logout all devices
                  </button>
                  <p className={styles.sectionSubtitle} style={{ marginTop: '12px' }}>
                    Instantly log out every active session across all devices except your current one.
                  </p>
                </div>
              </div>
            </div>
          )}

          {["payments"].includes(activeTab) && (
            <div className={styles.comingSoon}>
              <ImageIcon size={48} style={{ opacity: 0.1, marginBottom: '24px' }} />
              <h2 className={styles.sectionTitle}>Payments integration</h2>
              <p className={styles.sectionSubtitle}>This module is currently under development.</p>
            </div>
          )}
        </main>
      </div>

      {isInviteModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <button className={styles.modalClose} onClick={() => setIsInviteModalOpen(false)}>
              <X size={20} />
            </button>
            <h2 className={styles.sectionTitle} style={{ marginBottom: '8px' }}>Invite team member</h2>
            <p className={styles.sectionSubtitle} style={{ marginBottom: '32px' }}>Send an invitation link via WhatsApp with an OTP.</p>

            <form onSubmit={handleInvite} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Full name</label>
                <input 
                  type="text" required className={styles.formInput} 
                  placeholder="e.g. John Doe" value={inviteData.fullName}
                  onChange={(e) => setInviteData({...inviteData, fullName: e.target.value})}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Phone number</label>
                <input 
                  type="tel" required className={styles.formInput} 
                  placeholder="e.g. 0241234567" value={inviteData.phone}
                  onChange={(e) => setInviteData({...inviteData, phone: e.target.value})}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Role</label>
                <select 
                  className={styles.formInput} value={inviteData.role}
                  onChange={(e) => setInviteData({...inviteData, role: e.target.value})}
                >
                  <option value="manager">Manager</option>
                  <option value="support">Support</option>
                  <option value="admin">Super Admin</option>
                </select>
              </div>

              {inviteError && <div className={styles.toastError}>{inviteError}</div>}
              {inviteSuccess && <div className={styles.toastSuccess}>{inviteSuccess}</div>}

              <button type="submit" className={styles.btnPrimary} disabled={isInviting} style={{ marginTop: '8px', width: '100%' }}>
                {isInviting ? <><Loader2 size={18} className="animate-spin" /> Sending...</> : "Send invitation"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
