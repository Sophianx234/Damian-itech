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
} from "recharts";
import { Users, Package, ShoppingCart, DollarSign } from "lucide-react";
import styles from "./AdminDashboard.module.css";

const salesData = [
  { name: "Mon", total: 1200 },
  { name: "Tue", total: 2100 },
  { name: "Wed", total: 1800 },
  { name: "Thu", total: 2400 },
  { name: "Fri", total: 2800 },
  { name: "Sat", total: 3200 },
  { name: "Sun", total: 2900 },
];

const productViewsData = [
  { name: "Laptops", views: 4000 },
  { name: "Phones", views: 3000 },
  { name: "Audio", views: 2000 },
  { name: "Tablets", views: 2780 },
];

const ordersData = [
  { id: "#ORD-001", product: 'MacBook Pro 16"', customer: "John Doe", date: "2026-07-10", price: "$2,400", status: "Completed" },
  { id: "#ORD-002", product: "iPhone 15 Pro", customer: "Jane Smith", date: "2026-07-09", price: "$1,200", status: "Pending" },
  { id: "#ORD-003", product: "AirPods Pro 2", customer: "Alice Joe", date: "2026-07-08", price: "$250", status: "Cancelled" },
  { id: "#ORD-004", product: "iPad Air", customer: "Bob Wilson", date: "2026-07-07", price: "$600", status: "Completed" },
  { id: "#ORD-005", product: "Magic Keyboard", customer: "Charlie Day", date: "2026-07-06", price: "$299", status: "Completed" },
];

const topSoldItems = [
  { name: 'MacBook Pro 16"', sales: 840, percentage: 85 },
  { name: "iPhone 15 Pro", sales: 720, percentage: 72 },
  { name: "AirPods Pro 2", sales: 504, percentage: 64 },
  { name: "iPad Air", sales: 380, percentage: 50 },
  { name: "Apple Watch S9", sales: 290, percentage: 40 },
];

export default function AdminDashboardPage() {
  return (
    <div className={styles.dashboardContainer}>
      {/* Top Row: KPI Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.iconWrapper}>
            <Users size={18} className={styles.statIcon} />
          </div>
          <div className={styles.statInfo}>
            <p className={styles.statValue}>1,204</p>
            <h3 className={styles.statLabel}>Total Customers</h3>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.iconWrapper}>
            <Package size={18} className={styles.statIcon} />
          </div>
          <div className={styles.statInfo}>
            <p className={styles.statValue}>328</p>
            <h3 className={styles.statLabel}>Total Products</h3>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.iconWrapper}>
            <ShoppingCart size={18} className={styles.statIcon} />
          </div>
          <div className={styles.statInfo}>
            <p className={styles.statValue}>8,405</p>
            <h3 className={styles.statLabel}>Total Orders</h3>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.iconWrapper}>
            <DollarSign size={18} className={styles.statIcon} />
          </div>
          <div className={styles.statInfo}>
            <p className={styles.statValue}>$24.5k</p>
            <h3 className={styles.statLabel}>Total Sales</h3>
          </div>
        </div>
      </div>

      {/* Middle Row: Analytics Charts */}
      <div className={styles.chartsGrid}>
        <div className={styles.chartCard}>
          <h2 className={styles.cardTitle}>Sales Trend</h2>
          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer>
              <AreaChart data={salesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                />
                <Area type="monotone" dataKey="total" stroke="var(--primary-color)" fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={styles.chartCard}>
          <h2 className={styles.cardTitle}>Product Views</h2>
          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={productViewsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-primary)" />
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }}
                  itemStyle={{ color: 'var(--text-primary)' }}
                  cursor={{ fill: 'var(--border-primary)' }}
                />
                <Bar dataKey="views" fill="var(--primary-color)" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Row: Data Tables */}
      <div className={styles.tablesGrid}>
        <div className={styles.tableCard}>
          <h2 className={styles.cardTitle}>All Orders</h2>
          <table className={styles.ordersTable}>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Product</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Price</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {ordersData.map((order) => {
                let statusClass = styles.statusPending;
                if (order.status === "Completed") statusClass = styles.statusCompleted;
                if (order.status === "Cancelled") statusClass = styles.statusCancelled;
                
                return (
                  <tr key={order.id}>
                    <td style={{ color: '#ffffff', fontWeight: 500 }}>{order.id}</td>
                    <td>{order.product}</td>
                    <td>{order.customer}</td>
                    <td>{order.date}</td>
                    <td>{order.price}</td>
                    <td className={statusClass}>{order.status}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className={styles.tableCard}>
          <h2 className={styles.cardTitle}>Top Sold Items</h2>
          <div className={styles.topSoldList}>
            {topSoldItems.map((item) => (
              <div key={item.name} className={styles.topSoldItem}>
                <div className={styles.itemHeader}>
                  <span>{item.name}</span>
                  <span className={styles.itemValue}>{item.sales}</span>
                </div>
                <div className={styles.progressBarContainer}>
                  <div 
                    className={styles.progressBar} 
                    style={{ width: `${item.percentage}%` }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
