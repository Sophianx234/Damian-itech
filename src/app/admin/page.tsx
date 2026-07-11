"use client";

import React, { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import { Loader2 } from "lucide-react";
import styles from "./AdminDashboard.module.css";

const COLORS = ['#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe', '#ede9fe'];

export default function AdminDashboardPage() {
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
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <Loader2 className="animate-spin" size={48} color="var(--primary-color)" />
      </div>
    );
  }

  if (!data) {
    return <div style={{ color: "red", padding: "24px" }}>Failed to load dashboard data.</div>;
  }

  return (
    <div className={styles.dashboardContainer}>
      {/* Top Row: KPI Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <h3 className={styles.statLabel}>Total Customers</h3>
          <p className={styles.statValue}>{data.totalCustomers}</p>
        </div>
        <div className={styles.statCard}>
          <h3 className={styles.statLabel}>Total Products</h3>
          <p className={styles.statValue}>{data.totalProducts}</p>
        </div>
        <div className={styles.statCard}>
          <h3 className={styles.statLabel}>Total Orders</h3>
          <p className={styles.statValue}>{data.totalOrders}</p>
        </div>
        <div className={styles.statCard}>
          <h3 className={styles.statLabel}>Total Sales</h3>
          <p className={styles.statValue}>${data.totalSales.toLocaleString()}</p>
        </div>
      </div>

      {/* Middle Row: Analytics Charts */}
      <div className={styles.chartsGrid}>
        <div className={styles.chartCard}>
          <h2 className={styles.cardTitle}>Sales Trend (Last 7 Days)</h2>
          <div style={{ width: "100%", height: 300 }}>
            {data.salesData.length > 0 ? (
              <ResponsiveContainer>
                <AreaChart data={data.salesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary-color)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--primary-color)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-primary)" />
                  <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }}
                    itemStyle={{ color: 'var(--text-primary)' }}
                    labelStyle={{ color: 'var(--text-muted)' }}
                  />
                  <Area type="monotone" dataKey="total" stroke="var(--primary-color)" fillOpacity={1} fill="url(#colorSales)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                No sales data for the last 7 days.
              </div>
            )}
          </div>
        </div>

        <div className={styles.chartCard}>
          <h2 className={styles.cardTitle}>Products by Category</h2>
          <div style={{ width: "100%", height: 300 }}>
            {data.categoryData.length > 0 ? (
              <ResponsiveContainer>
                <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <Pie
                    data={data.categoryData}
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="views"
                  >
                    {data.categoryData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)', borderRadius: '8px' }}
                    itemStyle={{ color: 'var(--text-primary)' }}
                  />
                  <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '12px', color: 'var(--text-muted)' }}/>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                No products found.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Row: Data Tables */}
      <div className={styles.tablesGrid}>
        <div className={styles.tableCard}>
          <h2 className={styles.cardTitle}>Recent Orders</h2>
          <table className={styles.ordersTable}>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Product(s)</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Price</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {data.recentOrders.length > 0 ? (
                data.recentOrders.map((order: any) => {
                  let statusClass = styles.statusPending;
                  if (order.status.toLowerCase() === "completed" || order.status.toLowerCase() === "delivered") statusClass = styles.statusCompleted;
                  if (order.status.toLowerCase() === "cancelled") statusClass = styles.statusCancelled;
                  
                  return (
                    <tr key={order.id}>
                      <td style={{ color: '#ffffff', fontWeight: 500 }}>#{order.id}</td>
                      <td>{order.product}</td>
                      <td>{order.customer}</td>
                      <td>{order.date}</td>
                      <td>{order.price}</td>
                      <td className={statusClass}>{order.status}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", color: "var(--text-muted)", padding: "24px 0" }}>
                    No recent orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className={styles.tableCard}>
          <h2 className={styles.cardTitle}>Top Sold Items</h2>
          <div className={styles.topSoldList}>
            {data.topSoldItems.length > 0 ? (
              data.topSoldItems.map((item: any) => (
                <div key={item.name} className={styles.topSoldItem}>
                  <div className={styles.itemHeader}>
                    <span>{item.name}</span>
                    <span className={styles.itemValue}>{item.sales}</span>
                  </div>
                  <div className={styles.progressBarContainer}>
                    <div 
                      className={styles.progressBar} 
                      style={{ width: `${item.percentage}%`, backgroundColor: 'var(--primary-color)' }} 
                    />
                  </div>
                </div>
              ))
            ) : (
              <div style={{ textAlign: "center", color: "var(--text-muted)", padding: "24px 0" }}>
                No items sold yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
