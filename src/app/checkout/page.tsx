"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ShieldCheck, Lock, Loader2, ArrowLeft, Truck, Store, CreditCard } from 'lucide-react';
import { usePaystackPayment } from 'react-paystack';
import dynamic from 'next/dynamic';


import { useCart } from '../../context/CartContext';
import { useSettings } from '../../context/SettingsContext';
import styles from './Checkout.module.css';

const LocationMap = dynamic(() => import('../../components/Map/LocationMap'), {
  ssr: false,
  loading: () => (
    <div style={{ height: '300px', width: '100%', borderRadius: '12px', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Loader2 className="animate-spin" />
    </div>
  )
});



export default function CheckoutPage() {
  const router = useRouter();
  const { cart, cartTotal, clearCart } = useCart();
  const [mounted, setMounted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  const { settings, loading: settingsLoading } = useSettings();

  // Form State
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [fullName, setFullName] = useState("");
  const [region, setRegion] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("paystack");
  const [pickupLocation, setPickupLocation] = useState("");

  useEffect(() => {
    if (settings && !settingsLoading) {
      if (settings.deliveryZones && settings.deliveryZones.length > 0 && !region) {
        setRegion(settings.deliveryZones[0].name);
      }
      if (settings.pickupLocations && settings.pickupLocations.length > 0 && !pickupLocation) {
        setPickupLocation(settings.pickupLocations[0].name);
      }
    }
  }, [settings, settingsLoading, region, pickupLocation]);

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

  // Delivery Fee Calculation using Settings
  let deliveryFee = 0;
  if (paymentMethod !== 'pickup' && settings && region) {
    const activeZone = settings.deliveryZones?.find((z) => z.name === region);
    if (activeZone) {
      deliveryFee = activeZone.rate;
    }
    // Apply free delivery threshold if applicable
    if (settings.freeDeliveryThreshold && cartTotal >= settings.freeDeliveryThreshold) {
      deliveryFee = 0;
    }
  }
  
  const finalTotal = cartTotal + deliveryFee; // VAT removed to align with cart logic

  const formatCurrency = (value: number) => {
    return `₵${Number(value).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  // Paystack Configuration
  const paystackConfig = {
    reference: (new Date()).getTime().toString(),
    email: email || "customer@example.com",
    amount: Math.round(finalTotal * 100), // Amount is in pesewas
    publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "",
    currency: 'GHS',
  };

  const initializePayment = usePaystackPayment(paystackConfig);

  const submitOrder = async (reference?: string) => {
    setIsProcessing(true);
    
    const payload = {
      items: cart,
      paymentMethod,
      shippingDetails: {
        fullName,
        email,
        phone,
        region,
        streetAddress,
        additionalInfo,
        lat,
        lng,
      },
      pickupLocation,
      reference,
    };

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      
      if (data.success) {
        setOrderSuccess(true);
        clearCart();
      } else {
        alert("Checkout failed: " + data.message);
      }
    } catch (err) {
      console.error("Order submission error:", err);
      alert("An error occurred while placing your order.");
    } finally {
      setIsProcessing(false);
    }
  };

  const onSuccess = (reference: any) => {
    // Call our unified endpoint to verify payment and save the order
    submitOrder(reference.reference);
  };

  const onClose = () => {
    setIsProcessing(false);
    console.log("Payment dialog closed");
  };

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentMethod === 'paystack') {
      setIsProcessing(true);
      initializePayment({ onSuccess, onClose });
    } else {
      submitOrder();
    }
  };

  return (
    <>
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
                    <input type="email"  className={styles.input} placeholder="john@example.com" value={email} onChange={e => setEmail(e.target.value)} />
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
                <div className={styles.paymentSwitch}>
                  
                  <div 
                    className={`${styles.paymentOption} ${paymentMethod === 'delivery' ? styles.paymentOptionActive : ''}`}
                    onClick={() => setPaymentMethod('delivery')}
                  >
                    <Truck size={24} />
                    <span className={styles.paymentTitle}>Pay on Delivery</span>
                    <span className={styles.paymentDesc}>Cash or Momo on arrival</span>
                  </div>

                  <div 
                    className={`${styles.paymentOption} ${paymentMethod === 'pickup' ? styles.paymentOptionActive : ''}`}
                    onClick={() => setPaymentMethod('pickup')}
                  >
                    <Store size={24} />
                    <span className={styles.paymentTitle}>Pay on Pickup</span>
                    <span className={styles.paymentDesc}>Pay at our store</span>
                  </div>

                  <div 
                    className={`${styles.paymentOption} ${paymentMethod === 'paystack' ? styles.paymentOptionActive : ''}`}
                    onClick={() => setPaymentMethod('paystack')}
                  >
                    <CreditCard size={24} />
                    <span className={styles.paymentTitle}>Pay Online</span>
                    <span className={styles.paymentDesc}>Mobile Money or Card</span>
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
                  <LocationMap onLocationSelect={(lat, lng, addr, regionStr) => {
                    setLat(lat.toString());
                    setLng(lng.toString());
                    setStreetAddress(addr);
                    if (regionStr && settings?.deliveryZones) {
                      const matchedRegion = settings.deliveryZones.find(r => regionStr.toLowerCase().includes(r.name.toLowerCase()));
                      if (matchedRegion) {
                        setRegion(matchedRegion.name);
                      }
                    }
                  }} />
                  
                  <div className={styles.inputGrid} style={{ marginTop: '24px' }}>
                    <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                      <label className={styles.label}>Region (For Delivery Fee Calculation)</label>
                      <select required className={styles.select} value={region} onChange={e => setRegion(e.target.value)}>
                        {settings?.deliveryZones?.map((z) => (
                          <option key={z.id} value={z.name}>{z.name} - ₵{z.rate}</option>
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
                        {settings?.pickupLocations?.map((loc) => (
                          <option key={loc.id} value={loc.name}>{loc.name} - {loc.address}</option>
                        ))}
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
                      <div className={styles.summaryItemPrice}>
                        {formatCurrency(parseFloat(item.price.replace(/[^0-9.-]+/g, "")))}
                        {item.oldPrice && <span style={{ textDecoration: 'line-through', color: 'var(--text-muted)', fontSize: '0.8rem', marginLeft: '6px' }}>{item.oldPrice}</span>}
                      </div>
                      {item.attributes && item.attributes.length > 0 && (
                        <div style={{ marginTop: '4px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {item.attributes.map((a: any) => `${a.label}: ${a.value}`).join(' • ')}
                        </div>
                      )}
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
  {paymentMethod === 'pickup' 
    ? `Thank you for choosing Damian iTech! Your order has been securely confirmed. We will reach out to you via WhatsApp shortly with your order summary. Please have your payment ready when you arrive at ${pickupLocation}.`
    : paymentMethod === 'paystack'
    ? `Thank you for your purchase! Your payment was successfully processed. We will send your receipt and delivery tracking details via WhatsApp shortly. Your items will be dispatched to your location soon.`
    : `Thank you for choosing Damian iTech! Your order has been securely confirmed. We will reach out to you via WhatsApp shortly with your order summary. Your items will be dispatched to your location soon.`
  }
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
