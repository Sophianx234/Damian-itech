'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Package, Settings, LogOut, PackageOpen, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import styles from './AccountClient.module.css';

type OrderItem = {
  name: string;
  quantity: number;
  price: number;
  image?: string;
};

type Order = {
  id: string;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  createdAt: string;
  items: OrderItem[];
};

type UserData = {
  id: string;
  fullName: string;
  phone: string;
  role: string;
  createdAt: string;
};

interface AccountClientProps {
  user: UserData;
  orders: Order[];
}

export default function AccountClient({ user, orders }: AccountClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'settings'>('profile');
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      if (res.ok) {
        router.push('/login');
        router.refresh();
      }
    } catch (error) {
      console.error('Logout failed', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'pending') return styles.badgePending;
    if (s === 'processing') return styles.badgeProcessing;
    if (s === 'delivered' || s === 'paid') return styles.badgeDelivered;
    if (s === 'cancelled' || s === 'failed') return styles.badgeCancelled;
    return styles.badgePending;
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const renderProfile = () => (
    <motion.div
      key="profile"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className={styles.sectionGroup}
    >
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Profile Overview</h2>
        <p className={styles.sectionSubtitle}>View your personal details and account status.</p>
      </div>

      <div className={styles.profileHeader}>
        <div className={styles.avatarCircle}>
          {getInitials(user.fullName)}
        </div>
        <div className={styles.profileInfo}>
          <h3 className={styles.profileName}>{user.fullName}</h3>
          <p className={styles.profileMeta}>{user.phone} • Joined {new Date(user.createdAt).toLocaleDateString()}</p>
          <span className={`${styles.badge} ${styles.badgeProcessing}`} style={{ width: 'fit-content', marginTop: '8px' }}>
            {user.role}
          </span>
        </div>
      </div>
    </motion.div>
  );

  const renderOrders = () => (
    <motion.div
      key="orders"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className={styles.sectionGroup}
    >
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Order History</h2>
        <p className={styles.sectionSubtitle}>Track and manage your recent purchases.</p>
      </div>

      {orders.length === 0 ? (
        <div className={styles.emptyState}>
          <PackageOpen size={48} opacity={0.3} />
          <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>No orders found</h3>
          <p style={{ margin: 0 }}>You haven't placed any orders yet. Start shopping to see them here.</p>
        </div>
      ) : (
        <div className={styles.ordersList}>
          {orders.map((order) => (
            <div key={order.id} className={styles.orderCard}>
              <div className={styles.orderHeader}>
                <div className={styles.orderHeaderLeft}>
                  <div className={styles.orderId}>Order #{order.id.slice(-8).toUpperCase()}</div>
                  <div className={styles.orderDate}>
                    {new Date(order.createdAt).toLocaleString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
                <div className={styles.badges}>
                  <span className={`${styles.badge} ${getStatusBadgeClass(order.paymentStatus)}`}>
                    {order.paymentStatus}
                  </span>
                  <span className={`${styles.badge} ${getStatusBadgeClass(order.status)}`}>
                    {order.status}
                  </span>
                </div>
              </div>
              
              <div className={styles.orderItems}>
                {order.items.map((item, idx) => (
                  <div key={idx} className={styles.orderItem}>
                    <span className={styles.itemName}>
                      {item.quantity} × {item.name}
                    </span>
                    <span className={styles.itemPrice}>
                      GH₵ {(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
              
              <div className={styles.orderFooter}>
                <span>Total Amount</span>
                <span>GH₵ {order.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );

  const renderSettings = () => (
    <motion.div
      key="settings"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className={styles.sectionGroup}
    >
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Account Settings</h2>
        <p className={styles.sectionSubtitle}>Manage your account information.</p>
      </div>

      <div className={styles.formGrid}>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Full Name</label>
          <input type="text" className={styles.formInput} defaultValue={user.fullName} readOnly />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Phone Number</label>
          <input type="text" className={styles.formInput} defaultValue={user.phone} readOnly />
        </div>
      </div>
      <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
        To change your name or phone number, please contact support. This is to protect your account.
      </p>
    </motion.div>
  );

  return (
    <div className={styles.pageContainer}>
      <div className={styles.headerActions}>
        <div>
          <h1 className={styles.pageTitle}>My Account</h1>
          <p className={styles.pageSubtitle}>Manage your profile and track orders.</p>
        </div>
        <button
          onClick={handleLogout}
          className={styles.btnDanger}
          disabled={isLoggingOut}
        >
          {isLoggingOut ? <Loader2 className="animate-spin" size={18} /> : <LogOut size={18} />}
          {isLoggingOut ? 'Logging out...' : 'Log Out'}
        </button>
      </div>

      <div className={styles.settingsLayout}>
        {/* Sidebar Navigation */}
        <div className={styles.settingsSidebar}>
          <button
            className={`${styles.tabBtn} ${activeTab === 'profile' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <User size={18} /> Profile
          </button>
          <button
            className={`${styles.tabBtn} ${activeTab === 'orders' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <Package size={18} /> Orders
          </button>
          <button
            className={`${styles.tabBtn} ${activeTab === 'settings' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <Settings size={18} /> Settings
          </button>
        </div>

        {/* Content Area */}
        <div className={styles.settingsContent}>
          <AnimatePresence mode="wait">
            {activeTab === 'profile' && renderProfile()}
            {activeTab === 'orders' && renderOrders()}
            {activeTab === 'settings' && renderSettings()}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
