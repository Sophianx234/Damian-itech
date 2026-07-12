"use client";

import React, { useState } from "react";
import { MapPin, Phone, User, Truck, CheckCircle, PackageOpen, Loader2, Map as MapIcon, Navigation } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./DeliveryDashboard.module.css";
import DeliveryMap from "./DeliveryMap";

export default function DeliveryDashboard({ initialOrders }: { initialOrders: any[] }) {
  const [orders, setOrders] = useState(initialOrders);
  const [filter, setFilter] = useState("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [expandedMapId, setExpandedMapId] = useState<string | null>(null);

  const filteredOrders = orders.filter(order => {
    if (filter === "shipped") return order.orderStatus === "shipped";
    if (filter === "processing") return order.orderStatus === "processing";
    if (filter === "delivered") return order.orderStatus === "delivered";
    return true;
  });

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderStatus: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        setOrders(prev => prev.map(o => o._id === orderId ? { ...o, orderStatus: newStatus } : o));
      } else {
        alert(data.error || "Failed to update status");
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred");
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === "processing") return <span className={`${styles.badge} ${styles.badgeProcessing}`}>Processing</span>;
    if (status === "shipped") return <span className={`${styles.badge} ${styles.badgeShipped}`}>Out for Delivery</span>;
    if (status === "delivered") return <span className={`${styles.badge} ${styles.badgeDelivered}`}>Delivered</span>;
    return <span className={styles.badge}>{status}</span>;
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.headerActions}>
        <div>
          <h1 className={styles.pageTitle}>Delivery Dashboard</h1>
          <p className={styles.pageSubtitle}>Manage and update active deliveries in real-time.</p>
        </div>
      </div>

      <div className={styles.controls}>
        <select 
          className={styles.filterSelect}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">All Active Orders</option>
          <option value="processing">Ready for Pickup (Processing)</option>
          <option value="shipped">Out for Delivery</option>
          <option value="delivered">Completed (Delivered)</option>
        </select>
      </div>

      <div className={styles.grid}>
        {filteredOrders.length === 0 ? (
          <div className={styles.emptyState}>
            <PackageOpen size={48} opacity={0.3} style={{ marginBottom: "16px" }} />
            <h3>No orders found</h3>
            <p>There are currently no orders matching this filter.</p>
          </div>
        ) : (
          filteredOrders.map((order, idx) => {
            const customerName = order.shippingDetails?.fullName || "Guest Customer";
            const phone = order.shippingDetails?.phone || "N/A";
            const address = order.shippingDetails?.streetAddress || "No Address Provided";
            const region = order.shippingDetails?.region || "";
            const isProcessing = order.orderStatus === "processing";
            const isShipped = order.orderStatus === "shipped";
            const isDelivered = order.orderStatus === "delivered";
            
            const lat = order.shippingDetails?.lat ? parseFloat(order.shippingDetails.lat) : null;
            const lng = order.shippingDetails?.lng ? parseFloat(order.shippingDetails.lng) : null;
            const hasLocation = lat !== null && lng !== null && !isNaN(lat) && !isNaN(lng);

            return (
              <motion.div 
                key={order._id} 
                className={styles.deliveryCard}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
              >
                <div className={styles.cardHeader}>
                  <div>
                    <div className={styles.orderId}>Order #{order._id.slice(-8).toUpperCase()}</div>
                    <div className={styles.orderDate}>
                      {new Date(order.createdAt).toLocaleString()}
                    </div>
                  </div>
                  {getStatusBadge(order.orderStatus)}
                </div>

                <div className={styles.customerInfo}>
                  <div className={styles.infoRow}>
                    <div className={styles.iconWrapper}><User size={16} /></div>
                    <div className={styles.infoText}>
                      <span className={styles.infoLabel}>Customer</span>
                      <span className={styles.infoValue}>{customerName}</span>
                    </div>
                  </div>
                  
                  <div className={styles.infoRow}>
                    <div className={styles.iconWrapper}><MapPin size={16} /></div>
                    <div className={styles.infoText}>
                      <span className={styles.infoLabel}>Delivery Address</span>
                      <span className={styles.infoValue}>{address}{region ? `, ${region}` : ""}</span>
                    </div>
                  </div>

                  <div className={styles.infoRow}>
                    <div className={styles.iconWrapper}><Phone size={16} /></div>
                    <div className={styles.infoText}>
                      <span className={styles.infoLabel}>Phone</span>
                      <span className={styles.infoValue}>{phone}</span>
                    </div>
                  </div>
                </div>

                {hasLocation && (
                  <div className={styles.mapActions}>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                      <button 
                        className={styles.btnSecondary}
                        onClick={() => setExpandedMapId(expandedMapId === order._id ? null : order._id)}
                        style={{ flex: 1, padding: '8px' }}
                      >
                        <MapIcon size={16} /> {expandedMapId === order._id ? "Hide Map" : "View Map"}
                      </button>
                      <a 
                        href={`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.btnSecondary}
                        style={{ flex: 1, padding: '8px' }}
                      >
                        <Navigation size={16} /> Directions
                      </a>
                    </div>
                    
                    <AnimatePresence>
                      {expandedMapId === order._id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          style={{ overflow: "hidden" }}
                        >
                          <DeliveryMap lat={lat!} lng={lng!} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                <div className={styles.actionRow}>
                  <a 
                    href={`https://wa.me/${phone.replace(/[^0-9]/g, "")}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={styles.btnSecondary}
                  >
                    WhatsApp
                  </a>
                  
                  {isProcessing && (
                    <button 
                      className={styles.btnPrimary}
                      onClick={() => handleUpdateStatus(order._id, "shipped")}
                      disabled={updatingId === order._id}
                    >
                      {updatingId === order._id ? <Loader2 size={16} className="animate-spin" /> : <Truck size={16} />}
                      Out for Delivery
                    </button>
                  )}

                  {isShipped && (
                    <button 
                      className={styles.btnPrimary}
                      onClick={() => handleUpdateStatus(order._id, "delivered")}
                      disabled={updatingId === order._id}
                      style={{ backgroundColor: "#16a34a" }}
                    >
                      {updatingId === order._id ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                      Delivered
                    </button>
                  )}

                  {isDelivered && (
                    <button className={styles.btnPrimary} disabled style={{ backgroundColor: "#16a34a" }}>
                      <CheckCircle size={16} /> Completed
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
