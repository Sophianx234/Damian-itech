'use client';

import React, { useEffect } from 'react';
import { Printer } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './ReceiptClient.module.css';

interface ReceiptClientProps {
  order: any;
}

export default function ReceiptClient({ order }: ReceiptClientProps) {
  // Auto-print on load is nice, but some users might block it. 
  // We'll leave it up to the button.
  
  const handlePrint = () => {
    window.print();
  };

  const subtotal = order.totalAmount - (order.deliveryFee || 0);
  const orderDate = new Date(order.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div style={{ backgroundColor: '#f9f9f9', minHeight: '100vh', padding: '40px 20px' }}>
      <div className={styles.receiptContainer}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.brand}>
            {/* Try to use the logo if available, else text */}
            <h1 className={styles.brandName}>Damian iTech</h1>
            <div className={styles.brandDetails}>
              123 Tech Avenue, Accra, Ghana<br />
              support@damian-itech.com<br />
              +233 55 123 4567
            </div>
          </div>
          <div className={styles.receiptTitle}>
            <h2 className={styles.title}>Receipt</h2>
            <div className={styles.orderNumber}>Order #{order.id.slice(-8).toUpperCase()}</div>
          </div>
        </div>

        {/* Info Grid */}
        <div className={styles.infoGrid}>
          <div className={styles.infoBlock}>
            <span className={styles.infoLabel}>Billed To</span>
            <div className={styles.infoContent}>
              {order.shippingDetails ? (
                <>
                  <strong>{order.shippingDetails.fullName}</strong><br />
                  {order.shippingDetails.phone}<br />
                  {order.shippingDetails.streetAddress}<br />
                  {order.shippingDetails.region}
                </>
              ) : (
                <>
                  <strong>Customer</strong><br />
                  Pickup Order at: {order.pickupLocation || 'Store'}
                </>
              )}
            </div>
          </div>
          <div className={styles.infoBlock}>
            <span className={styles.infoLabel}>Payment Details</span>
            <div className={styles.infoContent}>
              <strong>Method:</strong> <span style={{ textTransform: 'capitalize' }}>{order.paymentMethod}</span><br />
              <strong>Status:</strong> <span style={{ textTransform: 'capitalize' }}>{order.paymentStatus}</span><br />
              <strong>Date:</strong> {orderDate}
            </div>
          </div>
        </div>

        {/* Items Table */}
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Description</th>
              <th style={{ textAlign: 'center' }}>Qty</th>
              <th style={{ textAlign: 'right' }}>Price</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item: any, idx: number) => (
              <tr key={idx}>
                <td>
                  <div className={styles.itemName}>{item.name}</div>
                </td>
                <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                <td style={{ textAlign: 'right' }}>GH₵ {item.price.toFixed(2)}</td>
                <td>GH₵ {(item.price * item.quantity).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className={styles.totals}>
          <div className={styles.totalRow}>
            <span>Subtotal</span>
            <span>GH₵ {subtotal.toFixed(2)}</span>
          </div>
          <div className={styles.totalRow}>
            <span>Delivery Fee</span>
            <span>GH₵ {(order.deliveryFee || 0).toFixed(2)}</span>
          </div>
          <div className={styles.grandTotal}>
            <span>Total</span>
            <span>GH₵ {order.totalAmount.toFixed(2)}</span>
          </div>
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          Thank you for shopping with Damian iTech!<br />
          If you have any questions concerning this invoice, please contact our support team.
        </div>

        {/* Actions (Hidden on Print) */}
        <div className={styles.actions}>
          <button onClick={handlePrint} className={styles.printBtn}>
            <Printer size={18} /> Print Receipt
          </button>
          <Link href="/orders" className={styles.backBtn}>
            Back to Orders
          </Link>
        </div>
      </div>
    </div>
  );
}
