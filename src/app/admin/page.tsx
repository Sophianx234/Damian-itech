"use client";

import React from "react";
import { motion } from "framer-motion";
import { DollarSign, ShoppingBag, Users, TrendingUp } from "lucide-react";
import styles from "./AdminDashboard.module.css";

const stats = [
  {
    title: "Total Revenue",
    value: "GH₵ 45,231.89",
    trend: "+20.1%",
    isUp: true,
    icon: DollarSign,
    color: "#10b981",
    bgColor: "rgba(16, 185, 129, 0.1)",
  },
  {
    title: "Active Users",
    value: "+2350",
    trend: "+180.1%",
    isUp: true,
    icon: Users,
    color: "#3b82f6",
    bgColor: "rgba(59, 130, 246, 0.1)",
  },
  {
    title: "Total Sales",
    value: "+12,234",
    trend: "+19%",
    isUp: true,
    icon: ShoppingBag,
    color: "#8b5cf6",
    bgColor: "rgba(139, 92, 246, 0.1)",
  },
  {
    title: "Active Now",
    value: "573",
    trend: "+201 since last hour",
    isUp: true,
    icon: TrendingUp,
    color: "#f59e0b",
    bgColor: "rgba(245, 158, 11, 0.1)",
  },
];

export default function AdminDashboardPage() {
  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.statsGrid}>
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              className={styles.statCard}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1, duration: 0.4 }}
            >
              <div className={styles.statHeader}>
                <h3 className={styles.statTitle}>{stat.title}</h3>
                <div
                  className={styles.statIcon}
                  style={{ backgroundColor: stat.bgColor, color: stat.color }}
                >
                  <Icon size={20} />
                </div>
              </div>
              <p className={styles.statValue}>{stat.value}</p>
              <span
                className={`${styles.statTrend} ${
                  stat.isUp ? styles.trendUp : styles.trendDown
                }`}
              >
                {stat.trend} from last month
              </span>
            </motion.div>
          );
        })}
      </div>

      <motion.div
        className={styles.recentSection}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.4 }}
      >
        <h2 className={styles.sectionTitle}>Recent Activity</h2>
        <p style={{ color: "var(--text-secondary)" }}>
          Your dashboard graphs and recent orders list will populate here.
        </p>
      </motion.div>
    </div>
  );
}
