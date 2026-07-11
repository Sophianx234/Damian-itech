"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Search, ChevronDown, Trash2, MoreVertical, Eye, X } from "lucide-react";
import styles from "./Orders.module.css";

type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";
type PaymentStatus = "pending" | "paid" | "failed";

interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  image?: string;
}

interface Order {
  id: string;
  guestEmail?: string;
  items: OrderItem[];
  totalAmount: number;
  deliveryFee: number;
  paymentMethod: string;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  shippingDetails?: {
    fullName: string;
    email: string;
    phone: string;
    region: string;
    streetAddress: string;
    additionalInfo?: string;
    lat?: string;
    lng?: string;
  };
  pickupLocation?: string;
  paystackReference?: string;
  createdAt: string;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("");
  
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
  const [orderToView, setOrderToView] = useState<Order | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch("/api/orders");
        const json = await res.json();
        if (json.success) {
          const formatted = json.data.map((o: any) => ({
            id: o._id,
            guestEmail: o.guestEmail,
            items: o.items,
            totalAmount: o.totalAmount,
            deliveryFee: o.deliveryFee,
            paymentMethod: o.paymentMethod,
            paymentStatus: o.paymentStatus,
            orderStatus: o.orderStatus,
            shippingDetails: o.shippingDetails,
            pickupLocation: o.pickupLocation,
            paystackReference: o.paystackReference,
            createdAt: new Date(o.createdAt).toLocaleString(),
          }));
          setOrders(formatted);
        }
      } catch (err) {
        console.error("Failed to load orders", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter((o) => {
    const matchesSearch = 
      o.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (o.shippingDetails?.fullName?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (o.guestEmail?.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesOrderStatus = orderStatusFilter ? o.orderStatus === orderStatusFilter : true;
    const matchesPaymentStatus = paymentStatusFilter ? o.paymentStatus === paymentStatusFilter : true;
    const matchesPaymentMethod = paymentMethodFilter ? o.paymentMethod === paymentMethodFilter : true;
    return matchesSearch && matchesOrderStatus && matchesPaymentStatus && matchesPaymentMethod;
  });

  const handleResetFilters = () => {
    setSearchQuery("");
    setOrderStatusFilter("");
    setPaymentStatusFilter("");
    setPaymentMethodFilter("");
  };

  const handleUpdate = async (id: string, updates: Partial<Order>) => {
    // Optimistic UI update
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, ...updates } : o))
    );

    // Call API
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      if (!res.ok) {
        throw new Error("Failed to update");
      }
    } catch (error) {
      console.error("Mutation failed", error);
      // In a real app, we'd revert the optimistic update here on failure
    }
  };

  const confirmDelete = (id: string) => {
    const order = orders.find(o => o.id === id);
    if (order) setOrderToDelete(order);
  };

  const executeDelete = async () => {
    if (!orderToDelete) return;
    const id = orderToDelete.id;

    // Optimistic UI update
    setOrders((prev) => prev.filter((o) => o.id !== id));
    setOrderToDelete(null);

    // Simulate API call
    try {
      const res = await fetch(`/api/orders/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
    } catch (err) {
      console.error("Failed to delete", err);
    }
  };

  const handleQuickView = (id: string) => {
    const order = orders.find(o => o.id === id);
    if (order) setOrderToView(order);
  };

  return (
    <div className={styles.pageContainer}>
      {/* Top Action Bar */}
      <div className={styles.topBar}>
        <div className={styles.searchWrapper}>
          <Search size={16} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search orders..."
            className={styles.searchInput}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Filter Row */}
      <div className={styles.filterRow}>
        <select className={styles.filterSelect} value={orderStatusFilter} onChange={(e) => setOrderStatusFilter(e.target.value)}>
          <option value="">Order Status</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select className={styles.filterSelect} value={paymentStatusFilter} onChange={(e) => setPaymentStatusFilter(e.target.value)}>
          <option value="">Payment Status</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="failed">Failed</option>
        </select>
        <select className={styles.filterSelect} value={paymentMethodFilter} onChange={(e) => setPaymentMethodFilter(e.target.value)}>
          <option value="">Payment Method</option>
          <option value="paystack">Paystack</option>
          <option value="pickup">Pickup</option>
          <option value="delivery">Delivery</option>
        </select>
        {(orderStatusFilter || paymentStatusFilter || paymentMethodFilter || searchQuery) && (
          <button className={styles.resetButton} onClick={handleResetFilters}>
            Reset Filters
          </button>
        )}
      </div>

      {/* Master Data Table */}
      <div className={styles.tableContainer}>
        {isLoading ? (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Payment</th>
                <th>Total</th>
                <th>Order Status</th>
                <th className={styles.actionsHeader}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {[...Array(5)].map((_, index) => (
                <tr key={index}>
                  <td>
                    <div className={`${styles.skeleton} ${styles.skeletonText}`}></div>
                  </td>
                  <td>
                    <div className={styles.productInfo}>
                      <div className={`${styles.skeleton} ${styles.skeletonText}`}></div>
                      <div className={`${styles.skeleton} ${styles.skeletonTextSm}`}></div>
                    </div>
                  </td>
                  <td>
                    <div className={styles.productCell}>
                      <div className={`${styles.skeleton} ${styles.skeletonImg}`}></div>
                      <div className={styles.productInfo}>
                        <div className={`${styles.skeleton} ${styles.skeletonText}`}></div>
                        <div className={`${styles.skeleton} ${styles.skeletonTextSm}`}></div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className={`${styles.skeleton} ${styles.skeletonTextSm}`}></div>
                  </td>
                  <td>
                    <div className={`${styles.skeleton} ${styles.skeletonText}`} style={{ width: '60px' }}></div>
                  </td>
                  <td>
                    <div className={`${styles.skeleton} ${styles.skeletonText}`} style={{ width: '70px' }}></div>
                  </td>
                  <td>
                    <div className={`${styles.skeleton} ${styles.skeletonAction}`}></div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Payment</th>
              <th>Total</th>
              <th>Order Status</th>
              <th className={styles.actionsHeader}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order, index) => {
              const isLast = index >= filteredOrders.length - 2;
              
              const totalItems = order.items.reduce((acc, item) => acc + item.quantity, 0);

              return (
                <tr key={order.id}>
                  {/* Order ID Column */}
                  <td>
                    <div className={styles.productInfo}>
                      <h4 className={styles.productTitle}>#{order.id.slice(-6).toUpperCase()}</h4>
                      <p className={styles.productBrand}>{order.createdAt}</p>
                    </div>
                  </td>

                  

                  {/* Items Column */}
                  <td>
                    <div className={styles.productCell}>
                      <div className={styles.productImageWrapper}>
                        {order.items[0]?.image ? (
                          <Image src={order.items[0].image} alt={order.items[0].name} fill className={styles.productThumb} sizes="48px" />
                        ) : (
                          <div style={{ width: '100%', height: '100%', backgroundColor: 'var(--border-primary)' }}></div>
                        )}
                      </div>
                      <div className={styles.productInfo}>
                        <h4 className={styles.productTitle} style={{ maxWidth: '120px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {order.items[0]?.name || "Item"}
                        </h4>
                        <p className={styles.productBrand}>
                          {totalItems > 1 ? `+ ${totalItems - 1} more` : '1 item'}
                        </p>
                      </div>
                    </div>
                  </td>
                  {/* Customer Column */}
                  <td>
                    <div className={styles.productInfo}>
                      <h4 className={styles.productTitle}>{order.shippingDetails?.fullName || "Guest"}</h4>
                      <p className={styles.productBrand}>{order.shippingDetails?.phone || "No Phone"}</p>
                    </div>
                  </td>

                  {/* Payment Column */}
                  <td>
                    <div className={styles.productInfo}>
                      <span className={styles.detailsCell} style={{ textTransform: 'capitalize' }}>
                        {order.paymentMethod || "N/A"}
                      </span>
                     
                    </div>
                  </td>

                  {/* Total Column */}
                  <td>
                    <span className={styles.detailsCell}>
                      ₵{order.totalAmount.toLocaleString()}
                    </span>
                  </td>

                  {/* Status Column */}
                  <td>
                    <StatusDropdown 
                      value={order.orderStatus as OrderStatus} 
                      onChange={(newVal) => handleUpdate(order.id, { orderStatus: newVal })} 
                      styles={styles} 
                      isLast={isLast}
                    />
                  </td>

                  {/* Actions Column */}
                  <td>
                    <ActionDropdown 
                      orderId={order.id}
                      handleDelete={confirmDelete} 
                      handleView={handleQuickView}
                      styles={styles} 
                      isLast={isLast}
                    />
                  </td>
                </tr>
              );
            })}
            </tbody>
          </table>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {orderToDelete && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3 className={styles.modalTitle}>Delete Order</h3>
            <p className={styles.modalText}>
              Are you sure you want to permanently delete this order?
            </p>
            
            <div className={styles.modalProductPreview}>
              <div className={styles.productInfo}>
                <h4 className={styles.productTitle}>Order #{orderToDelete.id.slice(-6).toUpperCase()}</h4>
                <p className={styles.productBrand}>{orderToDelete.shippingDetails?.fullName || "Guest"} &bull; ₵{orderToDelete.totalAmount.toLocaleString()}</p>
              </div>
            </div>

            <div className={styles.modalActions}>
              <button className={styles.cancelBtn} onClick={() => setOrderToDelete(null)}>
                Cancel
              </button>
              <button className={styles.confirmDeleteBtn} onClick={executeDelete}>
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick View Modal */}
      {orderToView && (
        <div className={styles.modalOverlay} onClick={() => setOrderToView(null)}>
          <div className={`${styles.modalContent} ${styles.quickViewModal}`} onClick={(e) => e.stopPropagation()}>
            <div className={styles.qvHeader}>
              <div>
                <h3 className={styles.modalTitle}>Order #{orderToView.id.slice(-6).toUpperCase()}</h3>
                <p className={styles.productBrand}>{orderToView.createdAt}</p>
              </div>
              <button className={styles.closeBtn} onClick={() => setOrderToView(null)}>
                <X size={20} />
              </button>
            </div>
            
            <div className={styles.qvScrollArea}>
              <div className={styles.qvBody}>
                <div className={styles.qvInfo}>
                  
                   <h4 style={{ margin: '12px 0 4px', fontSize: '15px' }}>Items</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {orderToView.items.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'center', backgroundColor: 'var(--bg-primary)', padding: '8px', borderRadius: '6px' }}>
                        {item.image && (
                          <div style={{ position: 'relative', width: '40px', height: '40px', borderRadius: '4px', overflow: 'hidden' }}>
                            <Image src={item.image} alt={item.name} fill style={{ objectFit: 'cover' }} />
                          </div>
                        )}
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '13px', fontWeight: 500 }}>{item.name}</div>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{item.quantity} x ₵{item.price}</div>
                        </div>
                        <div style={{ fontSize: '14px', fontWeight: 600 }}>
                          ₵{item.quantity * item.price}
                        </div>
                      </div>
                    ))}
                  </div>
                  <h4 style={{ margin: '12px 0 4px', fontSize: '15px' }}>Customer Details</h4>
                  <div className={styles.qvGrid}>
                    <div className={styles.qvItem}>
                      <span className={styles.qvLabel}>Name</span>
                      <span className={styles.qvValue}>{orderToView.shippingDetails?.fullName || "Guest"}</span>
                    </div>
                    <div className={styles.qvItem}>
                      <span className={styles.qvLabel}>Email</span>
                      <span className={styles.qvValue}>{orderToView.shippingDetails?.email || orderToView.guestEmail || "N/A"}</span>
                    </div>
                    <div className={styles.qvItem}>
                      <span className={styles.qvLabel}>Phone</span>
                      <span className={styles.qvValue}>{orderToView.shippingDetails?.phone || "N/A"}</span>
                    </div>
                  </div>

                  <h4 style={{ margin: '12px 0 4px', fontSize: '15px' }}>Order Details</h4>
                  <div className={styles.qvGrid}>
                    <div className={styles.qvItem}>
                      <span className={styles.qvLabel}>Order Status</span>
                      <span className={styles.qvValue} style={{ textTransform: 'capitalize' }}>{orderToView.orderStatus}</span>
                    </div>
                    <div className={styles.qvItem}>
                      <span className={styles.qvLabel}>Payment Status</span>
                      <span className={styles.qvValue} style={{ textTransform: 'capitalize' }}>{orderToView.paymentStatus}</span>
                    </div>
                    <div className={styles.qvItem}>
                      <span className={styles.qvLabel}>Payment Method</span>
                      <span className={styles.qvValue} style={{ textTransform: 'capitalize' }}>{orderToView.paymentMethod}</span>
                    </div>
                    <div className={styles.qvItem}>
                      <span className={styles.qvLabel}>Delivery Fee</span>
                      <span className={styles.qvValue}>₵{orderToView.deliveryFee}</span>
                    </div>
                  </div>

                  {orderToView.paymentMethod === 'pickup' && orderToView.pickupLocation ? (
                    <div className={styles.qvItem} style={{ gridColumn: '1 / -1' }}>
                      <span className={styles.qvLabel}>Pickup Location</span>
                      <span className={styles.qvValue}>{orderToView.pickupLocation}</span>
                    </div>
                  ) : orderToView.shippingDetails?.streetAddress ? (
                    <div className={styles.qvItem} style={{ gridColumn: '1 / -1' }}>
                      <span className={styles.qvLabel}>Shipping Address</span>
                      <span className={styles.qvValue}>
                        {orderToView.shippingDetails.streetAddress}, {orderToView.shippingDetails.region}
                      </span>
                    </div>
                  ) : null}

                  {orderToView.paystackReference && (
                    <div className={styles.qvItem} style={{ gridColumn: '1 / -1' }}>
                      <span className={styles.qvLabel}>Paystack Ref</span>
                      <span className={styles.qvValue}>{orderToView.paystackReference}</span>
                    </div>
                  )}

                  <div className={styles.qvItem} style={{ gridColumn: '1 / -1', fontWeight: 600 }}>
                   <span>Total</span>  <span className={styles.qvPrice}>₵{orderToView.totalAmount.toLocaleString()}</span>
                  </div>

                </div>
              </div>
            </div>

            <div className={styles.qvFooter}>
              <select 
                value={orderToView.orderStatus} 
                onChange={(e) => {
                  handleUpdate(orderToView.id, { orderStatus: e.target.value as OrderStatus });
                  setOrderToView({ ...orderToView, orderStatus: e.target.value as OrderStatus });
                }}
                className={styles.filterSelect}
                style={{ marginRight: '12px' }}
              >
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const StatusDropdown = ({ value, onChange, styles, isLast }: { value: OrderStatus, onChange: (val: OrderStatus) => void, styles: any, isLast?: boolean }) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);
  
  let statusClass = styles.statusPending;
  if (value === "processing") statusClass = styles.statusProcessing;
  if (value === "shipped") statusClass = styles.statusShipped;
  if (value === "delivered") statusClass = styles.statusDelivered;
  if (value === "cancelled") statusClass = styles.statusCancelled;

  return (
    <div className={styles.customSelectWrapper} ref={wrapperRef}>
      <div 
        className={`${styles.customSelectTrigger} ${statusClass}`} 
        onClick={() => setIsOpen(!isOpen)}
        style={{ textTransform: 'capitalize' }}
      >
        {value}
        <ChevronDown size={14} className={styles.customSelectIcon} />
      </div>
      {isOpen && (
        <div className={`${styles.customSelectMenu} ${isLast ? styles.dropdownUp : ""}`}>
          {(["pending", "processing", "shipped", "delivered", "cancelled"] as OrderStatus[]).map((status) => {
            const isSelected = status === value;
            return (
              <div 
                key={status} 
                className={`${styles.customSelectOption} ${isSelected ? styles.customSelectOptionSelected : ""}`} 
                onClick={() => {
                  onChange(status);
                  setIsOpen(false);
                }}
                style={{ textTransform: 'capitalize' }}
              >
                {status}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const ActionDropdown = ({ orderId, handleDelete, handleView, styles, isLast }: { orderId: string, handleDelete: (id: string) => void, handleView: (id: string) => void, styles: any, isLast?: boolean }) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <div className={styles.actionMenuWrapper} ref={wrapperRef}>
      <button 
        className={styles.actionMenuTrigger} 
        onClick={() => setIsOpen(!isOpen)}
        aria-label="More actions"
      >
        <MoreVertical size={16} />
      </button>
      {isOpen && (
        <div className={`${styles.actionMenuDropdown} ${isLast ? styles.dropdownUp : ""}`}>
          <button 
            onClick={() => {
              handleView(orderId);
              setIsOpen(false);
            }} 
            className={styles.actionMenuItem}
          >
            <Eye size={14} /> Quick View
          </button>
          <button 
            onClick={() => {
              handleDelete(orderId);
              setIsOpen(false);
            }} 
            className={`${styles.actionMenuItem} ${styles.actionMenuItemDanger}`}
          >
            <Trash2 size={14} /> Delete Order
          </button>
        </div>
      )}
    </div>
  );
};
