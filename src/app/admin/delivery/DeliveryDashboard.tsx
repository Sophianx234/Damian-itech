"use client";

import React, { useState } from "react";
import { MapPin, Phone, User, Truck, CheckCircle, PackageOpen, Loader2, Map as MapIcon, Navigation, ChevronDown, ChevronUp, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./DeliveryDashboard.module.css";
import DeliveryMap from "./DeliveryMap";

export default function DeliveryDashboard({ initialOrders }: { initialOrders: any[] }) {
  const [orders, setOrders] = useState(initialOrders);
  const [filter, setFilter] = useState("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [expandedMapId, setExpandedMapId] = useState<string | null>(null);
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredOrders = orders.filter(order => {
    if (filter === "shipped") return order.orderStatus === "shipped";
    if (filter === "processing") return order.orderStatus === "processing";
    if (filter === "delivered") return order.orderStatus === "delivered";
    return true;
  }).filter(order => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const orderIdStr = order._id.toLowerCase();
    const customerName = (order.shippingDetails?.fullName || "Guest Customer").toLowerCase();
    return orderIdStr.includes(q) || customerName.includes(q);
  });

  const processingCount = orders.filter(o => o.orderStatus === "processing").length;
  const shippedCount = orders.filter(o => o.orderStatus === "shipped").length;
  const deliveredCount = orders.filter(o => o.orderStatus === "delivered").length;
  const totalCount = orders.length;

  const handleUpdateStatus = async (orderId: string, newStatus: string, customerPhone?: string) => {
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

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <div className={styles.iconContainer} style={{backgroundColor: 'rgba(234, 179, 8, 0.1)'}}>
              <PackageOpen size={18} className={styles.statIcon} style={{color: '#ca8a04'}} />
            </div>
            <h3 className={styles.statLabel}>Ready for Pickup</h3>
          </div>
          <p className={styles.statValue}>{processingCount}</p>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <div className={styles.iconContainer} style={{backgroundColor: 'rgba(59, 130, 246, 0.1)'}}>
              <Truck size={18} className={styles.statIcon} style={{color: '#2563eb'}} />
            </div>
            <h3 className={styles.statLabel}>Out for Delivery</h3>
          </div>
          <p className={styles.statValue}>{shippedCount}</p>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <div className={styles.iconContainer} style={{backgroundColor: 'rgba(34, 197, 94, 0.1)'}}>
              <CheckCircle size={18} className={styles.statIcon} style={{color: '#16a34a'}} />
            </div>
            <h3 className={styles.statLabel}>Completed</h3>
          </div>
          <p className={styles.statValue}>{deliveredCount}</p>
        </div>
      </div>

      <div className={styles.controls}>
        <div className={styles.searchContainer}>
          <Search size={18} className={styles.searchIcon} />
          <input 
            type="text" 
            placeholder="Search Order ID or Customer..." 
            className={styles.searchInput}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
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

            const steps = ["processing", "shipped", "delivered"];
            const currentStepIndex = steps.indexOf(order.orderStatus);
            const isExpanded = expandedCardId === order._id;

            return (
              <motion.div 
                key={order._id} 
                className={styles.deliveryCard}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
              >
                <div 
                  className={styles.cardHeader} 
                  style={{ cursor: 'pointer', paddingBottom: isExpanded ? '16px' : '0', borderBottom: isExpanded ? '1px solid var(--border-primary)' : 'none' }}
                  onClick={() => setExpandedCardId(isExpanded ? null : order._id)}
                >
                  <div>
                    <div className={styles.orderId}>Order #{order._id.slice(-8).toUpperCase()}</div>
                    <div className={styles.orderDate}>
                      {new Date(order.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {getStatusBadge(order.orderStatus)}
                    <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}>
                      {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                  </div>
                </div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      style={{ overflow: "hidden" }}
                    >
                    
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
                      onClick={() => handleUpdateStatus(order._id, "delivered", phone)}
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
                 )}
                </AnimatePresence>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
