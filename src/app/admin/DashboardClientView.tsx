"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import { 
  Loader2, 
  DollarSign, 
  ShoppingCart, 
  Users, 
  CreditCard,
  Package, 
  Clock, 
  XCircle, 
  RefreshCw,
  BarChart2,
  PieChart as PieChartIcon
} from "lucide-react";
import styles from "./AdminDashboard.module.css";

const INVENTORY_COLORS = ['var(--primary-color)', 'var(--text-primary)'];

function DashboardSkeleton() {
  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.statsGrid}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className={styles.statCard}>
            <div className={styles.statHeader}>
              <div className={`${styles.skeleton} ${styles.skeletonIcon}`}></div>
              <div className={`${styles.skeleton} ${styles.skeletonText}`} style={{ width: '40%', marginBottom: 0 }}></div>
            </div>
            <div className={`${styles.skeleton} ${styles.skeletonValue}`} style={{ width: '80%' }}></div>
          </div>
        ))}
      </div>
      <div className={styles.chartsGrid}>
        <div className={styles.chartCard}>
          <div className={`${styles.skeleton} ${styles.skeletonTitle}`}></div>
          <div className={`${styles.skeleton} ${styles.skeletonChart}`}></div>
        </div>
        <div className={styles.chartCard}>
          <div className={`${styles.skeleton} ${styles.skeletonTitle}`}></div>
          <div className={`${styles.skeleton} ${styles.skeletonChart}`}></div>
        </div>
      </div>
      <div className={styles.fullWidthTable}>
        <div className={styles.tableCard}>
          <div className={`${styles.skeleton} ${styles.skeletonTitle}`}></div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className={`${styles.skeleton} ${styles.skeletonTableRow}`}></div>
          ))}
        </div>
      </div>
      <div className={styles.secondaryTablesGrid}>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className={styles.tableCard}>
            <div className={`${styles.skeleton} ${styles.skeletonTitle}`}></div>
            {Array.from({ length: 4 }).map((_, j) => (
              <div key={j} className={`${styles.skeleton} ${styles.skeletonTableRow}`}></div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DashboardClientView({ initialData }: { initialData: any }) {
  const data = initialData;

  if (!data) {
    return <div style={{ color: "red", padding: "24px" }}>Failed to load dashboard data.</div>;
  }

  const { kpis, salesData, inventoryBreakdown, recentOrders, swapOffers, lowStockAlerts, topCustomers } = data;

  return (
    <div className={styles.dashboardContainer}>
      {/* 1. KPI Overview Grid */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <div className={styles.iconContainer}>
              <DollarSign size={18} className={styles.statIcon} />
            </div>
            <h3 className={styles.statLabel}>Total Revenue</h3>
          </div>
          <p className={styles.statValue}>₵{kpis.totalRevenue.toLocaleString()}</p>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <div className={styles.iconContainer}>
              <ShoppingCart size={18} className={styles.statIcon} />
            </div>
            <h3 className={styles.statLabel}>Total Orders</h3>
          </div>
          <p className={styles.statValue}>{kpis.totalOrdersCount}</p>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <div className={styles.iconContainer}>
              <Users size={18} className={styles.statIcon} />
            </div>
            <h3 className={styles.statLabel}>Total Customers</h3>
          </div>
          <p className={styles.statValue}>{kpis.totalCustomers}</p>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <div className={styles.iconContainer}>
              <CreditCard size={18} className={styles.statIcon} />
            </div>
            <h3 className={styles.statLabel}>Avg Order Value</h3>
          </div>
          <p className={styles.statValue}>₵{kpis.averageOrderValue.toLocaleString()}</p>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <div className={styles.iconContainer}>
              <Package size={18} className={styles.statIcon} />
            </div>
            <h3 className={styles.statLabel}>Active Inventory</h3>
          </div>
          <p className={styles.statValue}>{kpis.activeInventory}</p>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <div className={styles.iconContainer}>
              <Clock size={18} className={styles.statIcon} />
            </div>
            <h3 className={styles.statLabel}>Pending Orders</h3>
          </div>
          <p className={styles.statValue}>{kpis.pendingOrdersCount}</p>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <div className={styles.iconContainer}>
              <XCircle size={18} className={styles.statIcon} />
            </div>
            <h3 className={styles.statLabel}>Failed Orders</h3>
          </div>
          <p className={styles.statValue}>{kpis.failedOrdersCount}</p>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <div className={styles.iconContainer}>
              <RefreshCw size={18} className={styles.statIcon} />
            </div>
            <h3 className={styles.statLabel}>Active Swaps</h3>
          </div>
          <p className={styles.statValue}>{kpis.activeSwapProposals}</p>
        </div>
      </div>

      {/* 2. Analytics Section */}
      <div className={styles.chartsGrid}>
        <div className={styles.chartCard}>
          <h2 className={styles.cardTitle}>
            <BarChart2 size={20} color="#8B5CF6" /> Revenue Overview
          </h2>
          <div style={{ width: "100%", height: 300 }}>
            {salesData.length > 0 ? (
              <ResponsiveContainer>
                <BarChart data={salesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-primary)" />
                  <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₵${value}`} />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }}
                    itemStyle={{ color: 'var(--text-primary)' }}
                    cursor={{ fill: 'var(--border-primary)' }}
                  />
                  <Bar dataKey="total" fill="var(--primary-color)" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: '#a1a1aa' }}>
                No revenue data available.
              </div>
            )}
          </div>
        </div>

        <div className={styles.chartCard}>
          <h2 className={styles.cardTitle}>
            <PieChartIcon size={20} color="#8B5CF6" /> Inventory Breakdown
          </h2>
          <div style={{ width: "100%", height: 300 }}>
            {inventoryBreakdown.length > 0 ? (
              <ResponsiveContainer>
                <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <Pie
                    data={inventoryBreakdown}
                    innerRadius={80}
                    outerRadius={110}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {inventoryBreakdown.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={INVENTORY_COLORS[index % INVENTORY_COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }}
                    itemStyle={{ color: 'var(--text-primary)' }}
                  />
                  <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '12px', color: 'var(--text-muted)' }}/>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: '#a1a1aa' }}>
                No inventory data.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. Primary Table (Full Width) */}
      <div className={styles.fullWidthTable}>
        <div className={styles.tableCard}>
          <h2 className={styles.cardTitle}>Recent Orders</h2>
          <div style={{ overflowX: "auto" }}>
            <table className={styles.dataTable}>
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Product</th>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.length > 0 ? (
                  recentOrders.map((order: any) => {
                    let statusClass = styles.statusPending;
                    if (order.status.toLowerCase() === "completed" || order.status.toLowerCase() === "delivered") statusClass = styles.statusCompleted;
                    if (order.status.toLowerCase() === "cancelled") statusClass = styles.statusCancelled;
                    
                    return (
                      <tr key={order.id}>
                        <td style={{ fontWeight: 500 }}>{order.customer}</td>
                        <td>{order.product}</td>
                        <td className={styles.textMuted}>{order.date}</td>
                        <td className={styles.textMuted}>{order.type}</td>
                        <td className={statusClass}>{order.status}</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} style={{ textAlign: "center", color: "#a1a1aa", padding: "32px 0" }}>
                      No recent orders.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 4. Secondary Tables Grid (3 Columns) */}
      <div className={styles.secondaryTablesGrid}>
        {/* Swap Offers */}
        <div className={styles.tableCard}>
          <h2 className={styles.cardTitle}>Swap Offers</h2>
          <div className={styles.swapList}>
            <div className={styles.swapHeader}>
              <span>User</span>
              <span>Target Product</span>
            </div>
            {swapOffers.length > 0 ? (
              swapOffers.map((offer: any) => (
                <div key={offer.id} className={styles.swapItem}>
                  <div className={styles.swapUser}>{offer.user}</div>
                  <div className={styles.swapTarget}>{offer.targetProduct}</div>
                </div>
              ))
            ) : (
              <div style={{ textAlign: "center", color: "#a1a1aa", padding: "32px 0" }}>
                No pending swap offers.
              </div>
            )}
          </div>
        </div>

        {/* Low Stock */}
        <div className={styles.tableCard}>
          <h2 className={styles.cardTitle}>Low Stock Alerts</h2>
          <div style={{ overflowX: "auto" }}>
            <table className={styles.dataTable}>
              <tbody>
                {lowStockAlerts.length > 0 ? (
                  lowStockAlerts.map((item: any) => (
                    <tr key={item.id}>
                      <td style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ position: 'relative', width: '32px', height: '32px', borderRadius: '4px', overflow: 'hidden', backgroundColor: 'var(--border-primary)' }}>
                          <Image src={item.image} alt={item.product} fill style={{ objectFit: 'cover' }} />
                        </div>
                        <span style={{ maxWidth: '120px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.product}</span>
                      </td>
                      <td className={item.stock === 0 ? styles.dangerText : styles.warningText} style={{ textAlign: 'right' }}>
                        {item.stock} left
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={2} style={{ textAlign: "center", color: "#a1a1aa", padding: "32px 0" }}>
                      Inventory looks good.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Customers */}
        <div className={styles.tableCard}>
          <h2 className={styles.cardTitle}>Top Customers</h2>
          <div style={{ overflowX: "auto" }}>
            <table className={styles.dataTable}>
              <tbody>
                {topCustomers.length > 0 ? (
                  topCustomers.map((c: any, index: number) => (
                    <tr key={index}>
                      <td style={{ color: '#a1a1aa' }}>{c.name}</td>
                      <td style={{ textAlign: 'right', fontWeight: 500, color: '#ffffff' }}>
                        {c.spent}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={2} style={{ textAlign: "center", color: "#a1a1aa", padding: "32px 0" }}>
                      No customers yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
