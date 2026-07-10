"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, Plus, ChevronDown, Edit2, Trash2, MoreVertical, Eye } from "lucide-react";
import styles from "./Products.module.css";

type ProductStatus = "Active" | "Reserved" | "Sold";

interface Product {
  id: string;
  slug: string;
  title: string;
  brand: string;
  category: string;
  productType: "Store" | "Used";
  condition?: string;
  isSwappable: boolean;
  batteryHealth?: number;
  ram?: string;
  storage?: string;
  customSpecs?: { key: string; value: string }[];
  price: string;
  status: ProductStatus;
  image: string;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [conditionFilter, setConditionFilter] = useState("");
  const [productTypeFilter, setProductTypeFilter] = useState("");
  const [swappableFilter, setSwappableFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/products");
        const json = await res.json();
        if (json.success) {
          const formatted = json.data.map((p: any) => ({
            id: p._id,
            slug: p.slug,
            title: p.title,
            brand: p.brand,
            category: p.category,
            productType: p.productType,
            condition: p.condition,
            isSwappable: p.isSwappable,
            batteryHealth: p.batteryHealth,
            ram: p.ram,
            storage: p.storage,
            customSpecs: p.customSpecs,
            price: `₵${Number(p.price).toLocaleString("en-US", { maximumFractionDigits: 0 })}`,
            status: p.status,
            image: p.images && p.images.length > 0 ? p.images[0] : "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=100&h=100&fit=crop",
          }));
          setProducts(formatted);
        }
      } catch (err) {
        console.error("Failed to load products", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.brand.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter ? p.category === categoryFilter : true;
    const matchesCondition = conditionFilter ? p.condition === conditionFilter : true;
    const matchesProductType = productTypeFilter ? p.productType === productTypeFilter : true;
    const matchesSwappable = swappableFilter ? (swappableFilter === "Yes" ? p.isSwappable : !p.isSwappable) : true;
    const matchesStatus = statusFilter ? p.status === statusFilter : true;
    return matchesSearch && matchesCategory && matchesCondition && matchesProductType && matchesSwappable && matchesStatus;
  });

  const handleResetFilters = () => {
    setSearchQuery("");
    setCategoryFilter("");
    setConditionFilter("");
    setProductTypeFilter("");
    setSwappableFilter("");
    setStatusFilter("");
  };

  const handleUpdate = async (id: string, updates: Partial<Product>) => {
    // Optimistic UI update
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );

    // Call API
    try {
      const formData = new FormData();
      Object.entries(updates).forEach(([key, value]) => {
        if (key === 'price') {
          // If it has a currency symbol, strip it
          const cleanPrice = value.toString().replace(/[^0-9.]/g, '');
          formData.append(key, cleanPrice);
        } else {
          formData.append(key, value as string);
        }
      });

      const res = await fetch(`/api/products/${id}`, {
        method: "PUT",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Failed to update");
      }
    } catch (error) {
      console.error("Mutation failed", error);
      // In a real app, we'd revert the optimistic update here on failure
    }
  };

  const confirmDelete = (id: string) => {
    const product = products.find(p => p.id === id);
    if (product) setProductToDelete(product);
  };

  const executeDelete = async () => {
    if (!productToDelete) return;
    const id = productToDelete.id;

    // Optimistic UI update
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setProductToDelete(null);

    // Simulate API call
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
    } catch (err) {
      console.error("Failed to delete", err);
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
          <option value="Phone">Phone</option>
          <option value="Laptop">Laptop</option>
          <option value="Console">Console</option>
          <option value="Audio">Audio</option>
        </select>
        <select className={styles.filterSelect} value={productTypeFilter} onChange={(e) => setProductTypeFilter(e.target.value)}>
          <option value="">Type</option>
          <option value="Store">Store</option>
          <option value="Used">Used</option>
        </select>
        <select className={styles.filterSelect} value={conditionFilter} onChange={(e) => setConditionFilter(e.target.value)}>
          <option value="">Condition</option>
          <option value="Pristine">Pristine</option>
          <option value="Excellent">Excellent</option>
          <option value="Good">Good</option>
          <option value="Open Box">Open Box</option>
          <option value="UK Used">UK Used</option>
        </select>
        <select className={styles.filterSelect} value={swappableFilter} onChange={(e) => setSwappableFilter(e.target.value)}>
          <option value="">Swap</option>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
        </select>
        <select className={styles.filterSelect} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">Status</option>
          <option value="Active">Active</option>
          <option value="Reserved">Reserved</option>
          <option value="Sold">Sold</option>
        </select>
        {(categoryFilter || conditionFilter || productTypeFilter || swappableFilter || statusFilter || searchQuery) && (
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
                <th>Product</th>
                <th>Details</th>
                <th>Price</th>
                <th>Status</th>
                <th className={styles.actionsHeader}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {[...Array(5)].map((_, index) => (
                <tr key={index}>
                  <td>
                    <div className={styles.productCell}>
                      <div className={`${styles.skeleton} ${styles.skeletonImg}`}></div>
                      <div className={styles.productInfo}>
                        <div className={`${styles.skeleton} ${styles.skeletonText}`}></div>
                        <div className={`${styles.skeleton} ${styles.skeletonTextSm}`}></div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className={styles.specsWrapper}>
                      <div className={`${styles.skeleton} ${styles.skeletonText}`}></div>
                      <div className={`${styles.skeleton} ${styles.skeletonBadge}`} style={{ marginTop: '4px' }}></div>
                    </div>
                  </td>
                  <td>
                    <div className={`${styles.skeleton} ${styles.skeletonText}`} style={{ width: '60px' }}></div>
                  </td>
                  <td>
                    <div className={`${styles.skeleton} ${styles.skeletonText}`} style={{ width: '70px' }}></div>
                  </td>
                  <td>
                    <div className={`${styles.skeleton} ${styles.skeletonAction}`}></div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
              <th>Product</th>
              <th>Details</th>
              <th>Price</th>
              <th>Status</th>
              <th className={styles.actionsHeader}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product, index) => {
              const isLast = index >= filteredProducts.length - 2;
              // Determine status class
              let statusClass = styles.statusActive;
              if (product.status === "Reserved") statusClass = styles.statusReserved;
              if (product.status === "Sold") statusClass = styles.statusSold;

              return (
                <tr key={product.id}>
                  {/* Product Info Column */}
                  <td>
                    <div className={styles.productCell}>
                      <div className={styles.productImageWrapper}>
                        <Image
                          src={product.image}
                          alt={product.title}
                          fill
                          className={styles.productThumb}
                        />
                      </div>
                      <div className={styles.productInfo}>
                        <h4 className={styles.productTitle}>{product.title}</h4>
                        <p className={styles.productBrand}>{product.brand}</p>
                      </div>
                    </div>
                  </td>

                  {/* Details Column */}
                  <td>
                    <div className={styles.specsWrapper}>
                      <span className={styles.detailsCell}>
                        {product.category} &bull; {product.productType}
                        {product.condition && ` (${product.condition})`}
                      </span>
                      {product.isSwappable && (
                        <span className={styles.swapBadge}>Swappable</span>
                      )}
                      
                      {/* Specs */}
                      <div className={styles.specsList}>
                        {product.batteryHealth && <span className={styles.specItem}>Battery: {product.batteryHealth}%</span>}
                        {product.ram && <span className={styles.specItem}>RAM: {product.ram}</span>}
                        {product.storage && <span className={styles.specItem}>Storage: {product.storage}</span>}
                        {product.customSpecs?.map((spec, i) => (
                          <span key={i} className={styles.specItem}>{spec.key}: {spec.value}</span>
                        ))}
                      </div>
                    </div>
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
                      isLast={isLast}
                    />
                  </td>

                  {/* Actions Column */}
                  <td>
                    <ActionDropdown 
                      productId={product.id}
                      slug={product.slug}
                      handleDelete={confirmDelete} 
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

      {/* Delete Confirmation Modal */}
      {productToDelete && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3 className={styles.modalTitle}>Delete Product</h3>
            <p className={styles.modalText}>
              Are you sure you want to permanently delete this product?
            </p>
            
            <div className={styles.modalProductPreview}>
              <div className={styles.productImageWrapper}>
                <Image
                  src={productToDelete.image}
                  alt={productToDelete.title}
                  fill
                  className={styles.productThumb}
                />
              </div>
              <div className={styles.productInfo}>
                <h4 className={styles.productTitle}>{productToDelete.title}</h4>
                <p className={styles.productBrand}>{productToDelete.brand} &bull; {productToDelete.price}</p>
              </div>
            </div>

            <div className={styles.modalActions}>
              <button className={styles.cancelBtn} onClick={() => setProductToDelete(null)}>
                Cancel
              </button>
              <button className={styles.confirmDeleteBtn} onClick={executeDelete}>
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const StatusDropdown = ({ value, onChange, styles, isLast }: { value: ProductStatus, onChange: (val: ProductStatus) => void, styles: any, isLast?: boolean }) => {
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
  
  let statusClass = styles.statusActive;
  if (value === "Reserved") statusClass = styles.statusReserved;
  if (value === "Sold") statusClass = styles.statusSold;

  return (
    <div className={styles.customSelectWrapper} ref={wrapperRef}>
      <div 
        className={`${styles.customSelectTrigger} ${statusClass}`} 
        onClick={() => setIsOpen(!isOpen)}
      >
        {value}
        <ChevronDown size={14} className={styles.customSelectIcon} />
      </div>
      {isOpen && (
        <div className={`${styles.customSelectMenu} ${isLast ? styles.dropdownUp : ""}`}>
          {(["Active", "Reserved", "Sold"] as ProductStatus[]).map((status) => {
            const isSelected = status === value;
            return (
              <div 
                key={status} 
                className={`${styles.customSelectOption} ${isSelected ? styles.customSelectOptionSelected : ""}`} 
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
};

const ActionDropdown = ({ productId, slug, handleDelete, styles, isLast }: { productId: string, slug: string, handleDelete: (id: string) => void, styles: any, isLast?: boolean }) => {
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
          <Link href={`/product/${slug}`} className={styles.actionMenuItem} target="_blank">
            <Eye size={14} /> View Product
          </Link>
          <Link href={`/admin/products/${productId}/edit`} className={styles.actionMenuItem}>
            <Edit2 size={14} /> Edit Product
          </Link>
          <button 
            onClick={() => {
              handleDelete(productId);
              setIsOpen(false);
            }} 
            className={`${styles.actionMenuItem} ${styles.actionMenuItemDanger}`}
          >
            <Trash2 size={14} /> Delete Product
          </button>
        </div>
      )}
    </div>
  );
};
