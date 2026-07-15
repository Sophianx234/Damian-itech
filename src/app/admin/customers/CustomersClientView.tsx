"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Search, ChevronDown, MoreVertical, Eye, X, User as UserIcon, Ban, CheckCircle, ChevronLeft, ChevronRight } from "lucide-react";
import styles from "./Customers.module.css";

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  image?: string;
}

interface Order {
  _id: string;
  totalAmount: number;
  orderStatus: string;
  createdAt: string;
  items: OrderItem[];
}

interface Customer {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  isVerified: boolean;
  isSuspended: boolean;
  createdAt: string;
  totalOrders: number;
  totalSpent: number;
  isGuest: boolean;
  orders: Order[];
}

export default function CustomersClientView({
  initialCustomers,
  totalPages,
  currentPage,
}: {
  initialCustomers: Customer[];
  totalPages: number;
  currentPage: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setCustomers(initialCustomers);
    setIsLoading(false);
  }, [initialCustomers]);

  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [typeFilter, setTypeFilter] = useState(searchParams.get("type") || "");
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "");
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "newest");
  
  const [customerToView, setCustomerToView] = useState<Customer | null>(null);
  const [customerToSuspend, setCustomerToSuspend] = useState<Customer | null>(null);

  // Debounce search update
  useEffect(() => {
    const handler = setTimeout(() => {
      updateUrl("search", searchQuery);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const updateUrl = (key: string, value: string) => {
    setIsLoading(true);
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    
    // Reset to page 1 on filter change
    if (key !== "page") {
      params.set("page", "1");
    }
    
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleFilterChange = (key: string, value: string, setter: React.Dispatch<React.SetStateAction<string>>) => {
    setter(value);
    updateUrl(key, value);
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setTypeFilter("");
    setStatusFilter("");
    setSortBy("newest");
    setIsLoading(true);
    router.push(pathname);
  };

  const handleQuickView = (id: string) => {
    const customer = customers.find(c => c.id === id);
    if (customer) setCustomerToView(customer);
  };

  const confirmSuspend = (customer: Customer) => {
    setCustomerToSuspend(customer);
  };

  const executeSuspend = async () => {
    if (!customerToSuspend) return;
    const id = customerToSuspend.id;
    const isSuspended = !customerToSuspend.isSuspended;

    // Optimistic UI update
    setCustomers((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isSuspended } : c))
    );
    
    // Update active modal customer if open
    if (customerToView?.id === id) {
      setCustomerToView({ ...customerToView, isSuspended });
    }

    setCustomerToSuspend(null);

    try {
      const res = await fetch(`/api/admin/customers/${id}/suspend`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isSuspended }),
      });

      if (!res.ok) {
        throw new Error("Failed to update status");
      }
    } catch (error) {
      console.error("Failed to suspend customer", error);
      // Revert optimistic update
      setCustomers((prev) =>
        prev.map((c) => (c.id === id ? { ...c, isSuspended: !isSuspended } : c))
      );
      if (customerToView?.id === id) {
        setCustomerToView({ ...customerToView, isSuspended: !isSuspended });
      }
    }
  };

  return (
    <div className={styles.pageContainer}>
      {/* Top Action Bar */}
      <div className={styles.topBar}>
        <div className={styles.searchWrapper}>
          <Search size={16} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search by name, phone, email, order ID, product, or status..."
            className={styles.searchInput}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Filter Row */}
      <div className={styles.filterRow}>
        <select className={styles.filterSelect} value={typeFilter} onChange={(e) => handleFilterChange("type", e.target.value, setTypeFilter)}>
          <option value="">All Types</option>
          <option value="registered">Registered</option>
          <option value="guest">Guest</option>
        </select>

        <select className={styles.filterSelect} value={statusFilter} onChange={(e) => handleFilterChange("status", e.target.value, setStatusFilter)}>
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
        </select>

        <select className={styles.filterSelect} value={sortBy} onChange={(e) => handleFilterChange("sort", e.target.value, setSortBy)}>
          <option value="newest">Sort by: Newest</option>
          <option value="oldest">Sort by: Oldest</option>
          <option value="highest_spent">Sort by: Highest Spent</option>
          <option value="most_orders">Sort by: Most Orders</option>
        </select>

        {(typeFilter || statusFilter || sortBy !== "newest" || searchQuery) && (
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
                <th>Customer</th>
                <th>Contact</th>
                <th>Type</th>
                <th>Total Orders</th>
                <th>Total Spent</th>
                <th>Joined</th>
                <th className={styles.actionsHeader}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {[...Array(5)].map((_, index) => (
                <tr key={index}>
                  <td>
                    <div className={styles.productCell}>
                      <div className={`${styles.skeleton} ${styles.skeletonImg}`} style={{ borderRadius: '50%' }}></div>
                      <div className={styles.productInfo}>
                        <div className={`${styles.skeleton} ${styles.skeletonText}`}></div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className={styles.productInfo}>
                      <div className={`${styles.skeleton} ${styles.skeletonTextSm}`}></div>
                      <div className={`${styles.skeleton} ${styles.skeletonTextSm}`}></div>
                    </div>
                  </td>
                  <td><div className={`${styles.skeleton} ${styles.skeletonTextSm}`}></div></td>
                  <td><div className={`${styles.skeleton} ${styles.skeletonTextSm}`}></div></td>
                  <td><div className={`${styles.skeleton} ${styles.skeletonTextSm}`}></div></td>
                  <td><div className={`${styles.skeleton} ${styles.skeletonTextSm}`}></div></td>
                  <td><div className={`${styles.skeleton} ${styles.skeletonAction}`}></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Customer</th>
                <th>Contact</th>
                <th>Type</th>
                <th>Orders</th>
                <th>Total Spent</th>
                <th>Joined</th>
                <th className={styles.actionsHeader}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer, index) => {
                const isLast = index >= customers.length - 2;

                return (
                  <tr key={customer.id}>
                    {/* Customer Column */}
                    <td>
                      <div className={styles.productCell}>
                        <div className={styles.productImageWrapper} style={{ borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-primary)' }}>
                          <UserIcon size={24} color="var(--text-muted)" />
                        </div>
                        <div className={styles.productInfo}>
                          <h4 className={styles.productTitle} style={{ maxWidth: '150px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {customer.fullName}
                            {customer.isSuspended && <span style={{ color: '#ef4444', fontSize: '11px', marginLeft: '6px', backgroundColor: 'rgba(239,68,68,0.1)', padding: '2px 6px', borderRadius: '4px' }}>Suspended</span>}
                          </h4>
                        </div>
                      </div>
                    </td>

                    {/* Contact Column */}
                    <td>
                      <div className={styles.productInfo}>
                        <h4 className={styles.productTitle} style={{ fontSize: '13px' }}>{customer.phone || 'N/A'}</h4>
                        {customer.email && <p className={styles.productBrand} style={{ fontSize: '12px' }}>{customer.email || 'N/A'}</p>}
                      </div>
                    </td>

                    {/* Type Column */}
                    <td>
                      <span className={styles.swapBadge} style={{ 
                        backgroundColor: customer.isGuest ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)', 
                        color: customer.isGuest ? '#f59e0b' : '#10b981',
                        border: `1px solid ${customer.isGuest ? 'rgba(245, 158, 11, 0.2)' : 'rgba(16, 185, 129, 0.2)'}`
                      }}>
                        {customer.isGuest ? "Guest" : "Registered"}
                      </span>
                    </td>

                    {/* Orders Column */}
                    <td>
                      <span className={styles.detailsCell}>
                        {customer.totalOrders}
                      </span>
                    </td>

                    {/* Total Spent Column */}
                    <td>
                      <span className={styles.detailsCell}>
                        ₵{customer.totalSpent.toLocaleString()}
                      </span>
                    </td>

                    {/* Joined Column */}
                    <td>
                      <span className={styles.detailsCell}>
                        {customer.createdAt}
                      </span>
                    </td>

                    {/* Actions Column */}
                    <td>
                      <ActionDropdown 
                        customer={customer}
                        handleView={handleQuickView}
                        confirmSuspend={confirmSuspend}
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

      {/* Pagination UI */}
      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button 
            className={styles.paginationBtn} 
            disabled={currentPage <= 1}
            onClick={() => updateUrl("page", (currentPage - 1).toString())}
          >
            <ChevronLeft size={16} /> Previous
          </button>
          <span className={styles.paginationInfo}>
            Page {currentPage} of {totalPages}
          </span>
          <button 
            className={styles.paginationBtn} 
            disabled={currentPage >= totalPages}
            onClick={() => updateUrl("page", (currentPage + 1).toString())}
          >
            Next <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Quick View Modal */}
      {customerToView && (
        <div className={styles.modalOverlay} onClick={() => setCustomerToView(null)}>
          <div className={`${styles.modalContent} ${styles.quickViewModal}`} onClick={(e) => e.stopPropagation()}>
            <div className={styles.qvHeader}>
              <div>
                <h3 className={styles.modalTitle}>{customerToView.fullName}</h3>
                <p className={styles.productBrand}>
                  {customerToView.isGuest ? 'Guest Customer' : 'Registered User'} &bull; Joined {customerToView.createdAt}
                </p>
              </div>
              <button className={styles.closeBtn} onClick={() => setCustomerToView(null)}>
                <X size={20} />
              </button>
            </div>
            
            <div className={styles.qvScrollArea}>
              <div className={styles.qvBody}>
                <div className={styles.qvInfo}>
                  
                  <h4 style={{ margin: '12px 0 4px', fontSize: '15px' }}>Contact Information</h4>
                  <div className={styles.qvGrid}>
                    <div className={styles.qvItem}>
                      <span className={styles.qvLabel}>Phone Number</span>
                      <span className={styles.qvValue}>{customerToView.phone || 'N/A'}</span>
                    </div>
                    <div className={styles.qvItem}>
                      <span className={styles.qvLabel}>Email Address</span>
                      <span className={styles.qvValue}>{customerToView.email || 'N/A'}</span>
                    </div>
                    {!customerToView.isGuest && (
                      <>
                        <div className={styles.qvItem}>
                          <span className={styles.qvLabel}>Verification Status</span>
                          <span className={styles.qvValue} style={{ color: customerToView.isVerified ? '#10b981' : '#f59e0b' }}>
                            {customerToView.isVerified ? 'Verified' : 'Unverified'}
                          </span>
                        </div>
                        <div className={styles.qvItem}>
                          <span className={styles.qvLabel}>Account Status</span>
                          <span className={styles.qvValue} style={{ color: customerToView.isSuspended ? '#ef4444' : '#10b981' }}>
                            {customerToView.isSuspended ? 'Suspended' : 'Active'}
                          </span>
                        </div>
                      </>
                    )}
                  </div>

                  <h4 style={{ margin: '12px 0 4px', fontSize: '15px' }}>Shopping Statistics</h4>
                  <div className={styles.qvGrid}>
                    <div className={styles.qvItem}>
                      <span className={styles.qvLabel}>Total Orders</span>
                      <span className={styles.qvValue}>{customerToView.totalOrders}</span>
                    </div>
                    <div className={styles.qvItem}>
                      <span className={styles.qvLabel}>Total Spent</span>
                      <span className={styles.qvValue}>₵{customerToView.totalSpent.toLocaleString()}</span>
                    </div>
                  </div>

                  {customerToView.orders && customerToView.orders.length > 0 && (
                    <>
                      <h4 style={{ margin: '24px 0 4px', fontSize: '15px' }}>Order History</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {customerToView.orders.map((order, idx) => (
                          <div key={idx} style={{ backgroundColor: 'var(--bg-primary)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-primary)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', borderBottom: '1px solid var(--border-primary)', paddingBottom: '8px' }}>
                              <div>
                                <div style={{ fontSize: '14px', fontWeight: 600 }}>Order #{order._id.slice(-6).toUpperCase()}</div>
                                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{new Date(order.createdAt).toLocaleDateString()}</div>
                              </div>
                              <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--primary-color)' }}>₵{order.totalAmount.toLocaleString()}</div>
                                <div style={{ fontSize: '12px', textTransform: 'capitalize', color: order.orderStatus === 'delivered' ? '#10b981' : order.orderStatus === 'cancelled' ? '#ef4444' : '#f59e0b' }}>
                                  {order.orderStatus}
                                </div>
                              </div>
                            </div>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              {order.items.map((item, itemIdx) => (
                                <div key={itemIdx} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                  {item.image ? (
                                    <div style={{ position: 'relative', width: '36px', height: '36px', borderRadius: '4px', overflow: 'hidden' }}>
                                      <Image src={item.image} alt={item.name} fill style={{ objectFit: 'cover' }} />
                                    </div>
                                  ) : (
                                    <div style={{ width: '36px', height: '36px', borderRadius: '4px', backgroundColor: 'var(--card-bg)' }}></div>
                                  )}
                                  <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '13px', fontWeight: 500 }}>{item.name}</div>
                                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{item.quantity} x ₵{item.price}</div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                </div>
              </div>
            </div>

            <div className={styles.qvFooter}>
               {!customerToView.isGuest && (
                 <button 
                   className={customerToView.isSuspended ? styles.confirmDeleteBtn : styles.cancelBtn} 
                   style={{ marginRight: 'auto', backgroundColor: customerToView.isSuspended ? '#10b981' : '#ef4444', color: 'white', border: 'none' }}
                   onClick={() => confirmSuspend(customerToView)}
                 >
                   {customerToView.isSuspended ? 'Unsuspend Account' : 'Suspend Account'}
                 </button>
               )}
               <button className={styles.cancelBtn} onClick={() => setCustomerToView(null)}>
                 Close
               </button>
            </div>
          </div>
        </div>
      )}

      {/* Suspend Confirmation Modal */}
      {customerToSuspend && (
        <div className={styles.modalOverlay} onClick={() => setCustomerToSuspend(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>
              {customerToSuspend.isSuspended ? 'Unsuspend Customer' : 'Suspend Customer'}
            </h3>
            <p className={styles.modalText}>
              Are you sure you want to {customerToSuspend.isSuspended ? 'unsuspend' : 'suspend'} <strong>{customerToSuspend.fullName}</strong>?
              {!customerToSuspend.isSuspended && " This will prevent them from making any new orders."}
            </p>
            
            <div className={styles.modalActions}>
              <button className={styles.cancelBtn} onClick={() => setCustomerToSuspend(null)}>
                Cancel
              </button>
              <button 
                className={styles.confirmDeleteBtn} 
                style={{ backgroundColor: customerToSuspend.isSuspended ? '#10b981' : '#ef4444' }}
                onClick={executeSuspend}
              >
                {customerToSuspend.isSuspended ? 'Yes, Unsuspend' : 'Yes, Suspend'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const ActionDropdown = ({ customer, handleView, confirmSuspend, styles, isLast }: { customer: Customer, handleView: (id: string) => void, confirmSuspend: (customer: Customer) => void, styles: any, isLast?: boolean }) => {
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
              handleView(customer.id);
              setIsOpen(false);
            }} 
            className={styles.actionMenuItem}
          >
            <Eye size={14} /> Quick View
          </button>
          {!customer.isGuest && (
            <button 
              onClick={() => {
                confirmSuspend(customer);
                setIsOpen(false);
              }} 
              className={`${styles.actionMenuItem} ${!customer.isSuspended ? styles.actionMenuItemDanger : ""}`}
              style={customer.isSuspended ? { color: '#10b981' } : {}}
            >
              {customer.isSuspended ? (
                <><CheckCircle size={14} /> Unsuspend User</>
              ) : (
                <><Ban size={14} /> Suspend User</>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
};
