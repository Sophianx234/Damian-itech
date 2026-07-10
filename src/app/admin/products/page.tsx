"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Search, Plus } from "lucide-react";
import styles from "./Products.module.css";

type ProductStatus = "Active" | "Reserved" | "Sold";

interface Product {
  id: string;
  title: string;
  brand: string;
  category: string;
  condition: string;
  price: string;
  status: ProductStatus;
  image: string;
}

const initialProducts: Product[] = [
  {
    id: "PROD-001",
    title: "iPhone 15 Pro Max",
    brand: "Apple",
    category: "Phones",
    condition: "Pristine",
    price: "$1,199.00",
    status: "Active",
    image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=100&h=100&fit=crop",
  },
  {
    id: "PROD-002",
    title: "Galaxy S24 Ultra",
    brand: "Samsung",
    category: "Phones",
    condition: "Excellent",
    price: "$1,099.00",
    status: "Reserved",
    image: "https://images.unsplash.com/photo-1707164998811-13c5fb368db5?w=100&h=100&fit=crop",
  },
  {
    id: "PROD-003",
    title: "MacBook Pro 16\"",
    brand: "Apple",
    category: "Laptops",
    condition: "Good",
    price: "$2,499.00",
    status: "Sold",
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=100&h=100&fit=crop",
  },
  {
    id: "PROD-004",
    title: "AirPods Pro (2nd Gen)",
    brand: "Apple",
    category: "Audio",
    condition: "Pristine",
    price: "$249.00",
    status: "Active",
    image: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=100&h=100&fit=crop",
  },
];

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>(initialProducts);

  const handleUpdate = async (id: string, updates: Partial<Product>) => {
    // Optimistic UI update
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );

    // Call API
    try {
      const res = await fetch("/api/admin/products/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...updates }),
      });

      if (!res.ok) {
        throw new Error("Failed to update");
      }
    } catch (error) {
      console.error("Mutation failed", error);
      // In a real app, we'd revert the optimistic update here on failure
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
            placeholder="Search products..."
            className={styles.searchInput}
          />
        </div>
        <button className={styles.addButton}>
          <Plus size={16} /> Add New Product
        </button>
      </div>

      {/* Filter Row */}
      <div className={styles.filterRow}>
        <select className={styles.filterSelect}>
          <option value="">Category</option>
          <option value="Phones">Phones</option>
          <option value="Laptops">Laptops</option>
          <option value="Audio">Audio</option>
        </select>
        <select className={styles.filterSelect}>
          <option value="">Condition</option>
          <option value="Pristine">Pristine</option>
          <option value="Excellent">Excellent</option>
          <option value="Good">Good</option>
        </select>
        <select className={styles.filterSelect}>
          <option value="">Status</option>
          <option value="Active">Active</option>
          <option value="Reserved">Reserved</option>
          <option value="Sold">Sold</option>
        </select>
      </div>

      {/* Master Data Table */}
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Product</th>
              <th>Details</th>
              <th>Price</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => {
              // Determine status class
              let statusClass = styles.statusActive;
              if (product.status === "Reserved") statusClass = styles.statusReserved;
              if (product.status === "Sold") statusClass = styles.statusSold;

              return (
                <tr key={product.id}>
                  {/* Product Info Column */}
                  <td>
                    <div className={styles.productCell}>
                      <Image
                        src={product.image}
                        alt={product.title}
                        width={48}
                        height={48}
                        className={styles.productThumb}
                      />
                      <div className={styles.productInfo}>
                        <h4 className={styles.productTitle}>{product.title}</h4>
                        <p className={styles.productBrand}>{product.brand}</p>
                      </div>
                    </div>
                  </td>

                  {/* Details Column */}
                  <td>
                    <span className={styles.detailsCell}>
                      {product.category} &bull; {product.condition}
                    </span>
                  </td>

                  {/* Price Column */}
                  <td>
                    <input
                      type="text"
                      className={styles.priceInput}
                      defaultValue={product.price}
                      onBlur={(e) => {
                        const newPrice = e.target.value;
                        if (newPrice !== product.price) {
                          handleUpdate(product.id, { price: newPrice });
                        }
                      }}
                    />
                  </td>

                  {/* Status Column */}
                  <td>
                    <select
                      className={`${styles.statusSelect} ${statusClass}`}
                      value={product.status}
                      onChange={(e) =>
                        handleUpdate(product.id, {
                          status: e.target.value as ProductStatus,
                        })
                      }
                    >
                      <option value="Active" className={styles.statusActive}>
                        Active
                      </option>
                      <option value="Reserved" className={styles.statusReserved}>
                        Reserved
                      </option>
                      <option value="Sold" className={styles.statusSold}>
                        Sold
                      </option>
                    </select>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
