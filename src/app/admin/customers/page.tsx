"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, ChevronDown, MoreVertical, Eye, X, User as UserIcon } from "lucide-react";
import styles from "./Customers.module.css";

interface Customer {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  isVerified: boolean;
  createdAt: string;
  totalOrders: number;
  totalSpent: number;
  isGuest: boolean;
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  
  const [customerToView, setCustomerToView] = useState<Customer | null>(null);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await fetch("/api/admin/customers");
        const json = await res.json();
        if (json.success) {
          const formatted = json.data.map((c: any) => ({
            ...c,
            createdAt: new Date(c.createdAt).toLocaleDateString(),
          }));
          setCustomers(formatted);
        }
      } catch (err) {
        console.error("Failed to load customers", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCustomers();
  }, []);

  const filteredCustomers = customers.filter((c) => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      (c.fullName && c.fullName.toLowerCase().includes(searchLower)) || 
      (c.phone && c.phone.includes(searchLower)) ||
      (c.email && c.email.toLowerCase().includes(searchLower));
      
    const matchesType = typeFilter === "registered" ? !c.isGuest : typeFilter === "guest" ? c.isGuest : true;
    return matchesSearch && matchesType;
  });

  const handleResetFilters = () => {
    setSearchQuery("");
    setTypeFilter("");
  };

  const handleQuickView = (id: string) => {
    const customer = customers.find(c => c.id === id);
    if (customer) setCustomerToView(customer);
  };

  return (
    <div className={styles.pageContainer}>
      {/* Top Action Bar */}
      <div className={styles.topBar}>
        <div className={styles.searchWrapper}>
          <Search size={16} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search customers by name, phone or email..."
            className={styles.searchInput}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Filter Row */}
      <div className={styles.filterRow}>
        <select className={styles.filterSelect} value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          <option value="">All Customers</option>
          <option value="registered">Registered</option>
          <option value="guest">Guest</option>
        </select>
        {(typeFilter || searchQuery) && (
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
              {filteredCustomers.map((customer, index) => {
                const isLast = index >= filteredCustomers.length - 2;

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
                          </h4>
                        </div>
                      </div>
                    </td>

                    {/* Contact Column */}
                    <td>
                      <div className={styles.productInfo}>
                        <h4 className={styles.productTitle} style={{ fontSize: '13px' }}>{customer.phone || 'N/A'}</h4>
                        <p className={styles.productBrand} style={{ fontSize: '12px' }}>{customer.email || 'N/A'}</p>
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
                        customerId={customer.id}
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
                      <div className={styles.qvItem} style={{ gridColumn: '1 / -1' }}>
                        <span className={styles.qvLabel}>Verification Status</span>
                        <span className={styles.qvValue} style={{ color: customerToView.isVerified ? '#10b981' : '#f59e0b' }}>
                          {customerToView.isVerified ? 'Verified' : 'Unverified'}
                        </span>
                      </div>
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

                </div>
              </div>
            </div>

            <div className={styles.qvFooter}>
               <button className={styles.cancelBtn} onClick={() => setCustomerToView(null)}>
                 Close
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const ActionDropdown = ({ customerId, handleView, styles, isLast }: { customerId: string, handleView: (id: string) => void, styles: any, isLast?: boolean }) => {
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
              handleView(customerId);
              setIsOpen(false);
            }} 
            className={styles.actionMenuItem}
          >
            <Eye size={14} /> Quick View
          </button>
        </div>
      )}
    </div>
  );
};
