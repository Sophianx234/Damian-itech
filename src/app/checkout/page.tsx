"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ShieldCheck, Lock, Loader2, ArrowLeft } from 'lucide-react';
import { usePaystackPayment } from 'react-paystack';
import dynamic from 'next/dynamic';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import { useCart } from '../../context/CartContext';
import styles from './Checkout.module.css';

const LocationMap = dynamic(() => import('../../components/Map/LocationMap'), {
  ssr: false,
  loading: () => (
    <div style={{ height: '300px', width: '100%', borderRadius: '12px', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Loader2 className="animate-spin" />
    </div>
  )
});

const GHANA_REGIONS = [
  "Greater Accra", "Ashanti", "Western", "Central", "Eastern", "Volta",
  "Northern", "Upper East", "Upper West", "Bono", "Bono East", "Ahafo",
  "Oti", "Savannah", "North East", "Western North"
];

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, cartTotal, clearCart } = useCart();
  const [mounted, setMounted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  // Form State
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [fullName, setFullName] = useState("");
  const [region, setRegion] = useState("Greater Accra");
  const [streetAddress, setStreetAddress] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("paystack");
  const [pickupLocation, setPickupLocation] = useState("Main Store, Accra");

  useEffect(() => {
    setMounted(true);
    // Auto-fill user details from session
    fetch("/api/auth/session")
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          if (data.user.fullName) setFullName(data.user.fullName);
          if (data.user.email) setEmail(data.user.email);
          if (data.user.phone) setPhone(data.user.phone);
        }
      })
      .catch(err => console.error("Failed to fetch session for checkout", err));
  }, []);

  if (!mounted) return null;

  if (cart.length === 0 && !orderSuccess) {
    router.push('/cart');
    return null;
  }

  // Delivery within Ghana (e.g. Free delivery for Greater Accra, fixed for outside)
  const deliveryFee = paymentMethod === 'pickup' ? 0 : (region === "Greater Accra" ? 20 : 50);
  const finalTotal = cartTotal + deliveryFee; // VAT removed to align with cart logic

  const formatCurrency = (value: number) => {
    return `₵${Number(value).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  // Paystack Configuration
  const paystackConfig = {
    reference: (new Date()).getTime().toString(),
    email: email || "customer@example.com",
    amount: Math.round(finalTotal * 100), // Amount is in pesewas
    publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    currency: 'GHS',
  };

  const initializePayment = usePaystackPayment(paystackConfig);

  const onSuccess = (reference: any) => {
    // Call the verification endpoint
    fetch('/api/verify-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reference: reference.reference }),
    })
    .then(res => res.json())
    .then(data => {
      setIsProcessing(false);
      if (data.success) {
        setOrderSuccess(true);
        clearCart();
        console.log("Payment successfully verified. Reference:", reference);
      } else {
        console.error("Payment verification failed:", data.message);
        alert("Payment verification failed: " + data.message);
      }
    })
    .catch(err => {
      setIsProcessing(false);
      console.error("Verification error:", err);
      alert("An error occurred while verifying your payment.");
    });
  };

  const onClose = () => {
    setIsProcessing(false);
    console.log("Payment dialog closed");
  };

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    if (paymentMethod === 'paystack') {
      // Trigger Paystack popup
      initializePayment({ onSuccess, onClose });
    } else {
      // Simulate order processing for Delivery / Pickup
      setTimeout(() => {
        setIsProcessing(false);
        setOrderSuccess(true);
        clearCart();
      }, 1500);
    }
  };

  return (
    <>
      <Header />
      <main className={styles.main}>
        <div className="container">
          
          {!orderSuccess && (
            <Link href="/cart" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', marginBottom: '32px', textDecoration: 'none', fontWeight: 500 }}>
              <ArrowLeft size={16} /> Return to Cart
            </Link>
          )}

          <form onSubmit={handlePlaceOrder} className={styles.checkoutGrid}>
            
            {/* Left Column: Form */}
            <div className={styles.formColumn}>
              
              <div className={styles.formSection}>
                <h2 className={styles.sectionTitle}>
                  <span className={styles.stepNumber}>1</span> Contact Information
                </h2>
                <div className={styles.inputGrid}>
                  <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                    <label className={styles.label}>Full Name</label>
                    <input type="text" required className={styles.input} placeholder="John Doe" value={fullName} onChange={e => setFullName(e.target.value)} />
                  </div>
                  <div className={styles.inputGroup}>
                    <label className={styles.label}>Email Address</label>
                    <input type="email" required className={styles.input} placeholder="john@example.com" value={email} onChange={e => setEmail(e.target.value)} />
                  </div>
                  <div className={styles.inputGroup}>
                    <label className={styles.label}>Phone Number</label>
                    <input type="tel" required className={styles.input} placeholder="024 123 4567" value={phone} onChange={e => setPhone(e.target.value)} />
                  </div>
                </div>
              </div>

              <div className={styles.formSection}>
                <h2 className={styles.sectionTitle}>
                  <span className={styles.stepNumber}>2</span> Payment Method
                </h2>
                <div className={styles.cardGrid}>
                  
                  <div 
                    className={`${styles.deliveryCard} ${paymentMethod === 'delivery' ? styles.deliveryCardActive : ''}`}
                    onClick={() => setPaymentMethod('delivery')}
                  >
                    <div className={styles.cardTitle}>
                      <span>Pay on Delivery</span>
                      <div className={styles.radioCircle} />
                    </div>
                    <div className={styles.cardDesc}>Pay with cash or mobile money upon delivery.</div>
                  </div>

                  <div 
                    className={`${styles.deliveryCard} ${paymentMethod === 'pickup' ? styles.deliveryCardActive : ''}`}
                    onClick={() => setPaymentMethod('pickup')}
                  >
                    <div className={styles.cardTitle}>
                      <span>Pay on Pickup</span>
                      <div className={styles.radioCircle} />
                    </div>
                    <div className={styles.cardDesc}>Pay at our physical store when you pick up.</div>
                  </div>

                  <div 
                    className={`${styles.deliveryCard} ${paymentMethod === 'paystack' ? styles.deliveryCardActive : ''}`}
                    onClick={() => setPaymentMethod('paystack')}
                  >
                    <div className={styles.cardTitle}>
                      <span>Pay via Momo / Card</span>
                      <div className={styles.radioCircle} />
                    </div>
                    <div className={styles.cardDesc}>Securely online using Mobile Money or Card.</div>
                  </div>

                </div>
              </div>

              {paymentMethod !== 'pickup' && (
              <div className={styles.formSection}>
                <h2 className={styles.sectionTitle}>
                  <span className={styles.stepNumber}>3</span> Delivery Details (Ghana)
                </h2>
                
                <div className={styles.mapContainerWrapper}>
                  <label className={styles.label}>1. Pinpoint your delivery location on the map</label>
                  <LocationMap onLocationSelect={(lat, lng, addr) => {
                    setLat(lat.toString());
                    setLng(lng.toString());
                    setStreetAddress(addr);
                  }} />
                  
                  <div className={styles.inputGrid} style={{ marginTop: '24px' }}>
                    <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                      <label className={styles.label}>Region (For Delivery Fee Calculation)</label>
                      <select required className={styles.select} value={region} onChange={e => setRegion(e.target.value)}>
                        {GHANA_REGIONS.map(r => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    </div>

                    <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                      <label className={styles.label}>2. Verify Street Address</label>
                      <input 
                        type="text" 
                        required 
                        className={styles.input} 
                        placeholder="e.g. 123 Independence Ave" 
                        value={streetAddress} 
                        onChange={e => setStreetAddress(e.target.value)} 
                      />
                    </div>

                    <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                      <label className={styles.label}>3. Additional Delivery Instructions (Optional)</label>
                      <textarea 
                        className={styles.input} 
                        rows={2}
                        style={{ resize: 'vertical', fontFamily: 'inherit' }}
                        placeholder="e.g. Blue gate next to the Shell station. Call upon arrival." 
                        value={additionalInfo} 
                        onChange={e => setAdditionalInfo(e.target.value)} 
                      />
                    </div>
                  </div>
                </div>
              </div>
              )}

              {paymentMethod === 'pickup' && (
                <div className={styles.formSection}>
                  <h2 className={styles.sectionTitle}>
                    <span className={styles.stepNumber}>3</span> Pickup Details
                  </h2>
                  <div className={styles.inputGrid}>
                    <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                      <label className={styles.label}>Select Pickup Location</label>
                      <select required className={styles.select} value={pickupLocation} onChange={e => setPickupLocation(e.target.value)}>
                        <option value="Main Store, Accra">Main Store, Accra</option>
                        <option value="Branch Office, Kumasi">Branch Office, Kumasi</option>
                        <option value="Outlet, Tema">Outlet, Tema</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Right Column: Summary */}
            <div className={styles.summaryPanel}>
              <h2 className={styles.sectionTitle} style={{ marginBottom: '32px' }}>Order Summary</h2>
              
              <div className={styles.summaryItems}>
                {cart.map((item: any) => (
                  <div key={item.id} className={styles.summaryItem}>
                    <div className={styles.summaryItemImgWrapper}>
                      <img src={item.image} alt={item.name} className={styles.summaryItemImg} />
                      <div className={styles.summaryItemBadge}>{item.quantity}</div>
                    </div>
                    <div className={styles.summaryItemInfo}>
                      <div className={styles.summaryItemName}>{item.name}</div>
                      <div className={styles.summaryItemPrice}>{formatCurrency(parseFloat(item.price.replace(/[^0-9.-]+/g, "")))}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className={styles.summaryDivider} />

              <div className={styles.summaryRow}>
                <span>Subtotal</span>
                <span>{formatCurrency(cartTotal)}</span>
              </div>
              <div className={styles.summaryRow}>
                <span>Estimated Tax</span>
                <span>{formatCurrency(0)}</span>
              </div>
              <div className={styles.summaryRow}>
                <span>{paymentMethod === 'pickup' ? 'Pickup' : `Delivery (${region})`}</span>
                <span>{formatCurrency(deliveryFee)}</span>
              </div>
              
              <div className={styles.summaryDivider} />

              <div className={`${styles.summaryRow} ${styles.totalRow}`}>
                <span>Total</span>
                <span>{formatCurrency(finalTotal)}</span>
              </div>

              <button 
                type="submit" 
                className={styles.placeOrderBtn}
                disabled={isProcessing || cart.length === 0}
              >
                {isProcessing ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <Lock size={18} />
                )}
                {isProcessing 
                  ? "Processing..." 
                  : (paymentMethod === 'paystack' ? "Pay with Paystack" : "Confirm Order")
                }
              </button>

              <div style={{ marginTop: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                <ShieldCheck size={16} />
                <span>Secured by Paystack</span>
              </div>
            </div>

          </form>
        </div>
      </main>
      <Footer />

      {/* Success Modal Overlay */}
      <AnimatePresence>
        {orderSuccess && (
          <motion.div 
            className={styles.successOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className={styles.successModal}
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ type: "spring", bounce: 0.4 }}
            >
              <div className={styles.successIcon}>
                <Check size={32} />
              </div>
              <h2 className={styles.successTitle}>Order Confirmed!</h2>
              <p className={styles.successDesc}>
                Thank you for your purchase. We've sent a confirmation email to you with tracking details. Your gear will be delivered to {region} shortly.
              </p>
              <Link href="/" className={styles.placeOrderBtn} style={{ textDecoration: 'none' }}>
                Return to Home
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
