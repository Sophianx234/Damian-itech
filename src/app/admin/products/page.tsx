"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, Plus, ChevronDown } from "lucide-react";
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
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [conditionFilter, setConditionFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.brand.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter ? p.category === categoryFilter : true;
    const matchesCondition = conditionFilter ? p.condition === conditionFilter : true;
    const matchesStatus = statusFilter ? p.status === statusFilter : true;
    return matchesSearch && matchesCategory && matchesCondition && matchesStatus;
  });

  const handleResetFilters = () => {
    setSearchQuery("");
    setCategoryFilter("");
    setConditionFilter("");
    setStatusFilter("");
  };

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
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Link href="/admin/products/new" className={styles.addButton}>
          <Plus size={16} /> Add New Product
        </Link>
      </div>

      {/* Filter Row */}
      <div className={styles.filterRow}>
        <select className={styles.filterSelect} value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          <option value="">Category</option>
          <option value="Phones">Phones</option>
          <option value="Laptops">Laptops</option>
          <option value="Audio">Audio</option>
        </select>
        <select className={styles.filterSelect} value={conditionFilter} onChange={(e) => setConditionFilter(e.target.value)}>
          <option value="">Condition</option>
          <option value="Pristine">Pristine</option>
          <option value="Excellent">Excellent</option>
          <option value="Good">Good</option>
        </select>
        <select className={styles.filterSelect} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">Status</option>
          <option value="Active">Active</option>
          <option value="Reserved">Reserved</option>
          <option value="Sold">Sold</option>
        </select>
        {(categoryFilter || conditionFilter || statusFilter || searchQuery) && (
          <button className={styles.resetButton} onClick={handleResetFilters}>
            Reset Filters
          </button>
        )}
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
            {filteredProducts.map((product) => {
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
                    <StatusDropdown 
                      value={product.status} 
                      onChange={(newVal) => handleUpdate(product.id, { status: newVal })} 
                      styles={styles} 
                    />
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

const StatusDropdown = ({ value, onChange, styles }: { value: ProductStatus, onChange: (val: ProductStatus) => void, styles: any }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  let statusClass = styles.statusActive;
  if (value === "Reserved") statusClass = styles.statusReserved;
  if (value === "Sold") statusClass = styles.statusSold;

  return (
    <div className={styles.customSelectWrapper} onMouseLeave={() => setIsOpen(false)}>
      <div 
        className={`${styles.customSelectTrigger} ${statusClass}`} 
        onClick={() => setIsOpen(!isOpen)}
      >
        {value}
        <ChevronDown size={14} className={styles.customSelectIcon} />
      </div>
      {isOpen && (
        <div className={styles.customSelectMenu}>
          {(["Active", "Reserved", "Sold"] as ProductStatus[]).map((status) => {
            let optionClass = styles.statusActive;
            if (status === "Reserved") optionClass = styles.statusReserved;
            if (status === "Sold") optionClass = styles.statusSold;
            
            return (
              <div
                key={status}
                className={`${styles.customSelectOption} ${optionClass}`}
                onClick={() => {
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
}
