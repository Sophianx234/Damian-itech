'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { PackageOpen, Download, HelpCircle, Check, Clock, Truck, Package } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './OrdersClient.module.css';

type OrderItem = {
  name: string;
  quantity: number;
  price: number;
  image?: string;
};

type Order = {
  id: string;
  totalAmount: number;
  deliveryFee: number;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  createdAt: string;
  items: OrderItem[];
};

interface OrdersClientProps {
  orders: Order[];
}

export default function OrdersClient({ orders }: OrdersClientProps) {
  
  const getStatusBadgeClass = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'pending') return styles.badgePending;
    if (s === 'processing') return styles.badgeProcessing;
    if (s === 'delivered' || s === 'paid') return styles.badgeDelivered;
    if (s === 'cancelled' || s === 'failed') return styles.badgeCancelled;
    return styles.badgePending;
  };

  const getTimelineSteps = (status: string) => {
    const s = status.toLowerCase();
    const isCancelled = s === 'cancelled' || s === 'failed';
    
    // Simplistic progression: pending -> processing -> shipped -> delivered
    const isPlaced = true; // Always placed
    const isProcessing = ['processing', 'shipped', 'delivered'].includes(s);
    const isShipped = ['shipped', 'delivered'].includes(s);
    const isDelivered = s === 'delivered';

    return [
      { id: 'placed', label: 'Order Placed', desc: 'We have received your order', active: isPlaced, icon: Clock },
      { id: 'processing', label: 'Processing', desc: 'We are preparing your items', active: isProcessing, icon: Package },
      { id: 'shipped', label: 'Out for Delivery', desc: 'Your order is on the way', active: isShipped, icon: Truck },
      { id: 'delivered', label: 'Delivered', desc: 'Your order has been delivered', active: isDelivered, icon: Check },
    ];
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.headerActions}>
        <div>
          <h1 className={styles.pageTitle}>Your Orders</h1>
          <p className={styles.pageSubtitle}>Track, return, or repurchase items from past orders.</p>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className={styles.emptyState}>
          <PackageOpen size={64} opacity={0.2} />
          <h2 className={styles.emptyTitle}>No Orders Yet</h2>
          <p className={styles.emptyText}>You haven't placed any orders. Discover our latest gadgets and gear to get started.</p>
          <Link href="/" className={styles.shopBtn}>
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className={styles.ordersGrid}>
          {orders.map((order, idx) => {
            const subtotal = order.totalAmount - (order.deliveryFee || 0);
            const timeline = getTimelineSteps(order.status);
            const isCancelled = ['cancelled', 'failed'].includes(order.status.toLowerCase());

            return (
              <motion.div 
                key={order.id} 
                className={styles.orderCard}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
              >
                {/* Header */}
                <div className={styles.orderHeader}>
                  <div className={styles.orderHeaderInfo}>
                    <div className={styles.infoBlock}>
                      <span className={styles.infoLabel}>Order Placed</span>
                      <span className={styles.infoValue}>
                        {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <div className={styles.infoBlock}>
                      <span className={styles.infoLabel}>Total</span>
                      <span className={styles.infoValue}>GH₵ {order.totalAmount.toFixed(2)}</span>
                    </div>
                    <div className={styles.infoBlock}>
                      <span className={styles.infoLabel}>Order ID</span>
                      <span className={styles.infoValue}>#{order.id.toUpperCase().slice(-8)}</span>
                    </div>
                  </div>
                  
                  <div className={styles.orderActions}>
                    <Link href={`/orders/${order.id}/receipt`} target="_blank" className={styles.btnOutline}>
                      <Download size={16} /> Receipt
                    </Link>
                    <a 
                      href={`https://wa.me/233551234567?text=${encodeURIComponent(`Hello Damian iTech Support, I need help with my Order #${order.id.slice(-8).toUpperCase()}.\n\nMy issue is: `)}`} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className={styles.btnOutline}
                    >
                      <HelpCircle size={16} /> Support
                    </a>
                  </div>
                </div>

                {/* Body */}
                <div className={styles.orderBody}>
                  {/* Items List */}
                  <div className={styles.itemsList}>
                    {order.items.map((item, i) => (
                      <div key={i} className={styles.itemRow}>
                        {item.image ? (
                          <Image src={item.image} alt={item.name} width={80} height={80} className={styles.itemImage} />
                        ) : (
                          <div className={styles.itemImagePlaceholder}>
                            <Package size={24} />
                          </div>
                        )}
                        <div className={styles.itemDetails}>
                          <h4 className={styles.itemName}>{item.name}</h4>
                          <span className={styles.itemMeta}>Qty: {item.quantity}</span>
                        </div>
                        <div className={styles.itemPrice}>
                          GH₵ {(item.price * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Sidebar (Timeline & Summary) */}
                  <div className={styles.orderSidebar}>
                    <div className={styles.sidebarSection}>
                      <h4 className={styles.sidebarTitle}>Order Status</h4>
                      
                      <div style={{ marginBottom: '12px', display: 'flex', gap: '8px' }}>
                        <span className={`${styles.badge} ${getStatusBadgeClass(order.paymentStatus)}`}>
                          Payment: {order.paymentStatus}
                        </span>
                        <span className={`${styles.badge} ${getStatusBadgeClass(order.status)}`}>
                          {order.status.toLowerCase() === 'shipped' ? 'Out for Delivery' : order.status}
                        </span>
                      </div>

                      {!isCancelled && (
                        <div className={styles.timeline}>
                          {timeline.map((step, i) => {
                            const Icon = step.icon;
                            return (
                              <div key={step.id} className={`${styles.timelineStep} ${step.active ? styles.timelineStepActive : ''}`}>
                                <div className={styles.timelineIcon}>
                                  <Icon size={14} strokeWidth={step.active ? 3 : 2} />
                                </div>
                                <div className={styles.timelineContent}>
                                  <span className={styles.timelineTitle}>{step.label}</span>
                                  {step.active && <span className={styles.timelineDesc}>{step.desc}</span>}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    <div className={styles.sidebarSection} style={{ marginTop: 'auto' }}>
                      <h4 className={styles.sidebarTitle}>Summary</h4>
                      <div className={styles.summaryRow}>
                        <span>Subtotal</span>
                        <span>GH₵ {subtotal.toFixed(2)}</span>
                      </div>
                      <div className={styles.summaryRow}>
                        <span>Delivery Fee</span>
                        <span>GH₵ {(order.deliveryFee || 0).toFixed(2)}</span>
                      </div>
                      <div className={styles.summaryTotal}>
                        <span>Grand Total</span>
                        <span>GH₵ {order.totalAmount.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
