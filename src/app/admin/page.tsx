"use client";

import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import { Loader2 } from "lucide-react";
import styles from "./AdminDashboard.module.css";

const INVENTORY_COLORS = ['#ffffff', '#8B5CF6']; // Stark white for Store, Cyber Violet for Used

export default function DashboardMainContent() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success) {
          setData(resData.data);
        }
      })
      .catch((err) => console.error("Error fetching dashboard data:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className={styles.loaderContainer}>
        <Loader2 className="animate-spin" size={48} color="#ffffff" />
      </div>
    );
  }

  if (!data) {
    return <div style={{ color: "red", padding: "24px" }}>Failed to load dashboard data.</div>;
  }

  const { kpis, salesData, inventoryBreakdown, recentOrders, swapOffers, lowStockAlerts, topCustomers } = data;

  return (
    <div className={styles.dashboardContainer}>
      {/* 1. KPI Overview Grid */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <h3 className={styles.statLabel}>Total Revenue</h3>
          <p className={styles.statValue}>${kpis.totalRevenue.toLocaleString()}</p>
        </div>
        <div className={styles.statCard}>
          <h3 className={styles.statLabel}>Total Orders</h3>
          <p className={styles.statValue}>{kpis.totalOrdersCount}</p>
        </div>
        <div className={styles.statCard}>
          <h3 className={styles.statLabel}>Avg Order Value</h3>
          <p className={styles.statValue}>${kpis.averageOrderValue.toLocaleString()}</p>
        </div>
        <div className={styles.statCard}>
          <h3 className={styles.statLabel}>Active Inventory</h3>
          <p className={styles.statValue}>{kpis.activeInventory}</p>
        </div>
        <div className={styles.statCard}>
          <h3 className={styles.statLabel}>Pending Orders</h3>
          <p className={styles.statValue}>{kpis.pendingOrdersCount}</p>
        </div>
        <div className={styles.statCard}>
          <h3 className={styles.statLabel}>Active Swap Proposals</h3>
          <p className={styles.statValue}>{kpis.activeSwapProposals}</p>
        </div>
      </div>

      {/* 2. Analytics Section */}
      <div className={styles.chartsGrid}>
        <div className={styles.chartCard}>
          <h2 className={styles.cardTitle}>Revenue Overview</h2>
          <div style={{ width: "100%", height: 300 }}>
            {salesData.length > 0 ? (
              <ResponsiveContainer>
                <BarChart data={salesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1a1a1a" />
                  <XAxis dataKey="name" stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#000000', borderColor: '#1a1a1a', color: '#ffffff' }}
                    itemStyle={{ color: '#ffffff' }}
                    cursor={{ fill: '#1a1a1a' }}
                  />
                  <Bar dataKey="total" fill="#ffffff" radius={[2, 2, 0, 0]} />
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
          <h2 className={styles.cardTitle}>Inventory Breakdown</h2>
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
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#000000', borderColor: '#1a1a1a', color: '#ffffff' }}
                    itemStyle={{ color: '#ffffff' }}
                  />
                  <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '12px', color: '#a1a1aa' }}/>
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

      {/* 3. Operational Tables */}
      <div className={styles.tablesGrid}>
        {/* Recent Orders */}
        <div className={styles.tableCard}>
          <h2 className={styles.cardTitle}>Recent Orders</h2>
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
                      <td>{order.customer}</td>
                      <td>{order.product}</td>
                      <td className={styles.textMuted}>{order.date}</td>
                      <td className={styles.textMuted}>{order.type}</td>
                      <td className={statusClass}>{order.status}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", color: "#a1a1aa", padding: "24px 0" }}>
                    No recent orders.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Swap Offers */}
        <div className={styles.tableCard}>
          <h2 className={styles.cardTitle}>Swap Offers & Reservations</h2>
          <div className={styles.swapList}>
            <div className={styles.swapHeader} style={{ gridTemplateColumns: '1fr 2fr' }}>
              <span>User</span>
              <span>Target Product</span>
            </div>
            {swapOffers.length > 0 ? (
              swapOffers.map((offer: any) => (
                <div key={offer.id} className={styles.swapItem} style={{ gridTemplateColumns: '1fr 2fr' }}>
                  <div className={styles.swapUser}>{offer.user}</div>
                  <div className={styles.swapTarget}>{offer.targetProduct}</div>
                </div>
              ))
            ) : (
              <div style={{ textAlign: "center", color: "#a1a1aa", padding: "24px 0" }}>
                No pending swap offers.
              </div>
            )}
          </div>
        </div>

        {/* Low Stock & Top Customers */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className={styles.tableCard}>
            <h2 className={styles.cardTitle}>Low Stock Alerts</h2>
            <table className={styles.dataTable}>
              <tbody>
                {lowStockAlerts.length > 0 ? (
                  lowStockAlerts.map((item: any) => (
                    <tr key={item.id}>
                      <td>{item.product}</td>
                      <td className={item.stock === 0 ? styles.dangerText : styles.warningText} style={{ textAlign: 'right' }}>
                        {item.stock} left
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={2} style={{ textAlign: "center", color: "#a1a1aa", padding: "24px 0" }}>
                      Inventory looks good.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className={styles.tableCard}>
            <h2 className={styles.cardTitle}>Top Customers</h2>
            <table className={styles.dataTable}>
              <tbody>
                {topCustomers.length > 0 ? (
                  topCustomers.map((c: any, index: number) => (
                    <tr key={index}>
                      <td>{c.name}</td>
                      <td style={{ textAlign: 'right', fontWeight: 500, color: '#ffffff' }}>
                        {c.spent}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={2} style={{ textAlign: "center", color: "#a1a1aa", padding: "24px 0" }}>
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
