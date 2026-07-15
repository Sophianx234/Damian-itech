"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Search, X, Trash2, Eye, MoreVertical, ChevronLeft, ChevronRight } from 'lucide-react';
import { hasPermission } from "@/lib/rbac";
import styles from './SupportDashboard.module.css';

interface Ticket {
  _id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  status: 'open' | 'in-progress' | 'resolved';
  createdAt: string;
}

interface SupportDashboardProps {
  initialTickets: Ticket[];
  totalPages: number;
  currentPage: number;
}

const StatusDropdown = ({ value, onChange, styles, isLast }: { value: string, onChange: (val: string) => void, styles: any, isLast?: boolean }) => {
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

  let statusClass = styles.open;
  if (value === "in-progress") statusClass = styles["in-progress"];
  if (value === "resolved") statusClass = styles.resolved;

  return (
    <div className={styles.customSelectWrapper} ref={wrapperRef}>
      <div 
        className={`${styles.badge} ${statusClass} ${styles.customSelectTrigger}`} 
        onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
      >
        {value}
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.customSelectIcon}><path d="m6 9 6 6 6-6"/></svg>
      </div>
      {isOpen && (
        <div className={`${styles.customSelectMenu} ${isLast ? styles.dropdownUp : ""}`}>
          {(["open", "in-progress", "resolved"] as const).map((status) => {
            const isSelected = status === value;
            return (
              <div 
                key={status} 
                className={`${styles.customSelectOption} ${isSelected ? styles.customSelectOptionSelected : ""}`} 
                onClick={(e) => {
                  e.stopPropagation();
                  onChange(status);
                  setIsOpen(false);
                }}
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

const ActionDropdown = ({ ticketId, handleDelete, handleView, styles, isLast, canDelete = true }: { ticketId: string, handleDelete: (id: string) => void, handleView: (id: string) => void, styles: any, isLast?: boolean, canDelete?: boolean }) => {
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
        onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
        aria-label="More actions"
      >
        <MoreVertical size={16} />
      </button>
      {isOpen && (
        <div className={`${styles.actionMenuDropdown} ${isLast ? styles.dropdownUp : ""}`}>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              handleView(ticketId);
              setIsOpen(false);
            }} 
            className={styles.actionMenuItem}
          >
            <Eye size={14} /> View Ticket
          </button>
          {canDelete && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(ticketId);
                setIsOpen(false);
              }} 
              className={`${styles.actionMenuItem} ${styles.actionMenuItemDanger}`}
            >
              <Trash2 size={14} /> Delete Ticket
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default function SupportDashboard({ initialTickets, totalPages, currentPage }: SupportDashboardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [tickets, setTickets] = useState<Ticket[]>(initialTickets);
  const [isLoading, setIsLoading] = useState(false);
  const [userRole, setUserRole] = useState<string>('');

  useEffect(() => {
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setUserRole(data.user.role);
      })
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    setTickets(initialTickets);
    setIsLoading(false);
  }, [initialTickets]);

  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [filterStatus, setFilterStatus] = useState<string>(searchParams.get('status') || 'all');
  
  const [ticketToView, setTicketToView] = useState<Ticket | null>(null);
  const [ticketToDelete, setTicketToDelete] = useState<Ticket | null>(null);

  // Debounce search update
  useEffect(() => {
    const handler = setTimeout(() => {
      updateUrl("search", searchTerm);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const updateUrl = (key: string, value: string) => {
    setIsLoading(true);
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== 'all') {
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

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/support/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setTickets(tickets.map(t => t._id === id ? { ...t, status: newStatus as any } : t));
        if (ticketToView?._id === id) {
          setTicketToView({ ...ticketToView, status: newStatus as any });
        }
      }
    } catch (error) {
      console.error('Failed to update status', error);
    }
  };

  const confirmDelete = (id: string) => {
    const ticket = tickets.find(t => t._id === id);
    if (ticket) setTicketToDelete(ticket);
  };

  const executeDelete = async () => {
    if (!ticketToDelete) return;
    try {
      const res = await fetch(`/api/support/${ticketToDelete._id}`, { method: 'DELETE' });
      if (res.ok) {
        setTickets(tickets.filter(t => t._id !== ticketToDelete._id));
        setTicketToDelete(null);
      }
    } catch (error) {
      console.error('Failed to delete ticket', error);
    }
  };



  return (
    <div className={styles.pageContainer}>
      <div className={styles.topBar}>
        <h1 className={styles.title}>Support Tickets</h1>
        <div className={styles.controls}>
          <div className={styles.searchWrapper}>
            <Search size={16} className={styles.searchIcon} />
            <input 
              type="text" 
              placeholder="Search by name, email, or ID..." 
              className={styles.searchInput}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select 
            className={styles.filterSelect}
            value={filterStatus}
            onChange={(e) => handleFilterChange('status', e.target.value, setFilterStatus)}
          >
            <option value="all">All Statuses</option>
            <option value="open">Open</option>
            <option value="in-progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>

      <div className={styles.contentWrapper}>
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Date</th>
                <th>User</th>
                <th>Message</th>
                <th>Status</th>
                <th className={styles.actionsHeader}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tickets.length > 0 ? tickets.map((ticket, index) => {
                const isLast = index >= tickets.length - 2 && tickets.length > 3;
                return (
                  <tr 
                    key={ticket._id} 
                    className={styles.tr}
                  >
                    <td className={styles.td}>
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </td>
                    <td className={styles.td}>
                      <div className={styles.userInfo}>
                        <span className={styles.userName}>{ticket.name}</span>
                        <span className={styles.userEmail}>{ticket.email}</span>
                      </div>
                    </td>
                    <td className={styles.td}>
                      <p className={styles.messageSnippet} title={ticket.message}>
                        {ticket.message}
                      </p>
                    </td>
                    <td className={styles.td}>
                      <StatusDropdown 
                        value={ticket.status} 
                        onChange={(newVal) => updateStatus(ticket._id, newVal)} 
                        styles={styles} 
                        isLast={isLast}
                      />
                    </td>
                    <td className={`${styles.td} ${styles.actionCell}`}>
                        <ActionDropdown 
                          ticketId={ticket._id}
                          handleDelete={confirmDelete}
                          handleView={(id) => {
                            const t = tickets.find(x => x._id === id);
                            if (t) setTicketToView(t);
                          }}
                          styles={styles}
                          isLast={isLast}
                          canDelete={hasPermission(userRole, 'delete')}
                        />
                      </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={5} className={styles.emptyState}>No tickets found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
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

      {/* Delete Confirmation Modal */}
      {ticketToDelete && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3 className={styles.modalTitle}>Delete Ticket</h3>
            <p className={styles.modalText}>
              Are you sure you want to permanently delete this support ticket from {ticketToDelete.name}?
            </p>
            <div className={styles.modalActions}>
              <button className={styles.cancelBtn} onClick={() => setTicketToDelete(null)}>
                Cancel
              </button>
              <button className={styles.confirmDeleteBtn} onClick={executeDelete}>
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick View Modal for Ticket */}
      {ticketToView && (
        <div className={styles.modalOverlay} onClick={() => setTicketToView(null)}>
          <div className={`${styles.modalContent} ${styles.quickViewModal}`} onClick={(e) => e.stopPropagation()}>
            <div className={styles.qvHeader}>
              <div>
                <h3 className={styles.modalTitle}>Ticket: {ticketToView.name}</h3>
                <p className={styles.monospace}>ID: {ticketToView._id}</p>
              </div>
              <button className={styles.closeBtn} onClick={() => setTicketToView(null)}>
                <X size={20} />
              </button>
            </div>
            
            <div className={styles.qvScrollArea}>
              <div className={styles.qvBody}>
                <div className={styles.qvGrid}>
                  <div className={styles.qvItem}>
                    <span className={styles.qvLabel}>Submitted On</span>
                    <span className={styles.qvValue}>{new Date(ticketToView.createdAt).toLocaleString()}</span>
                  </div>
                  <div className={styles.qvItem}>
                    <span className={styles.qvLabel}>Email Address</span>
                    <span className={styles.qvValue}>
                      <a href={`mailto:${ticketToView.email}`} className={styles.link}>{ticketToView.email}</a>
                    </span>
                  </div>
                  {ticketToView.phone && (
                    <div className={styles.qvItem}>
                      <span className={styles.qvLabel}>Phone Number</span>
                      <span className={styles.qvValue}>
                        <a href={`tel:${ticketToView.phone}`} className={styles.link}>{ticketToView.phone}</a>
                      </span>
                    </div>
                  )}
                  <div className={styles.qvItem}>
                    <span className={styles.qvLabel}>Current Status</span>
                    <span className={styles.qvValue}>
                      <span className={`${styles.badge} ${styles[ticketToView.status]}`}>{ticketToView.status}</span>
                    </span>
                  </div>
                  <div className={`${styles.qvItem} ${styles.fullWidth}`}>
                    <span className={styles.qvLabel}>Message</span>
                    <div className={styles.messageBox}>{ticketToView.message}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.qvFooter}>
              <select 
                className={styles.statusSelect}
                value={ticketToView.status}
                onChange={(e) => updateStatus(ticketToView._id, e.target.value)}
                style={{ width: 'auto' }}
              >
                <option value="open">Mark as Open</option>
                <option value="in-progress">Mark as In Progress</option>
                <option value="resolved">Mark as Resolved</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
