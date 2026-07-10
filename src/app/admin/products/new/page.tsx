"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, UploadCloud, X } from "lucide-react";
import styles from "./NewProduct.module.css";

function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") 
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");
}

export default function NewProductPage() {
  const router = useRouter();
  const [category, setCategory] = useState("");
  const [productType, setProductType] = useState<"Store" | "Used">("Store");
  const [isSwappable, setIsSwappable] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setImages(prev => {
        const combined = [...prev, ...newFiles];
        return combined.slice(0, 5); // Limit to max 5 images
      });
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const form = e.currentTarget;
    const title = (form.elements.namedItem("title") as HTMLInputElement).value;
    const slug = slugify(title);

    const formData = new FormData(form);
    formData.append("slug", slug);
    formData.append("isSwappable", String(isSwappable));

    images.forEach((file, index) => {
      formData.append(`image_${index}`, file);
    });

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Failed to create product");
      }

      router.push("/admin/products");
    } catch (error) {
      console.error("Submission failed", error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.pageContainer}>
      {/* Header */}
      <div className={styles.header}>
        <Link href="/admin/products" className={styles.backButton} aria-label="Go back">
          <ArrowLeft size={18} />
        </Link>
        <h1 className={styles.pageTitle}>Add New Product</h1>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        
        {/* Basic Details Card */}
        <div className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Basic Details</h2>
            <p className={styles.sectionSubtitle}>Enter the core information for your product.</p>
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="title" className={styles.label}>Product Title</label>
            <input type="text" id="title" name="title" required className={styles.input} placeholder="e.g. iPhone 15 Pro Max" />
          </div>
          <div className={styles.row}>
            <div className={styles.formGroup}>
              <label htmlFor="price" className={styles.label}>Price</label>
              <input type="text" id="price" name="price" required className={styles.input} placeholder="e.g. $1,199.00" />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="brand" className={styles.label}>Brand</label>
              <input type="text" id="brand" name="brand" required className={styles.input} placeholder="e.g. Apple" />
            </div>
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="category" className={styles.label}>Category</label>
            <select id="category" name="category" required className={styles.select} value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="" disabled>Select Category</option>
              <option value="Phone">Phone</option>
              <option value="Laptop">Laptop</option>
              <option value="Console">Console</option>
              <option value="Audio">Audio</option>
            </select>
          </div>
        </div>

        {/* Classification Card */}
        <div className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Classification</h2>
            <p className={styles.sectionSubtitle}>Define how this product is sold and its current state.</p>
          </div>
          
          <div className={styles.formGroup}>
            <label className={styles.label}>Product Type</label>
            <div className={styles.radioGroup}>
              <label className={styles.radioLabel}>
                <input type="radio" name="productType" value="Store" checked={productType === "Store"} onChange={() => setProductType("Store")} className={styles.radioInput} />
                Store (Brand New)
              </label>
              <label className={styles.radioLabel}>
                <input type="radio" name="productType" value="Used" checked={productType === "Used"} onChange={() => setProductType("Used")} className={styles.radioInput} />
                Used Market
              </label>
            </div>
          </div>

          {productType === "Used" && (
            <div className={styles.formGroup}>
              <label htmlFor="condition" className={styles.label}>Condition</label>
              <select id="condition" name="condition" required className={styles.select} defaultValue="">
                <option value="" disabled>Select Condition</option>
                <option value="Pristine">Pristine</option>
                <option value="Excellent">Excellent</option>
                <option value="Good">Good</option>
                <option value="Open Box">Open Box</option>
                <option value="UK Used">UK Used</option>
              </select>
            </div>
          )}

          <div 
            className={styles.checkboxCard} 
            onClick={() => setIsSwappable(!isSwappable)}
          >
            <input 
              type="checkbox" 
              checked={isSwappable} 
              readOnly 
              className={styles.checkboxInput} 
            />
            <span className={styles.checkboxLabel}>Available for Swap</span>
          </div>
        </div>

        {/* Dynamic Specifications Card */}
        {category && (
          <div className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Specifications</h2>
              <p className={styles.sectionSubtitle}>Additional details specific to {category.toLowerCase()}s.</p>
            </div>
            {category === "Phone" && (
              <div className={styles.formGroup}>
                <label htmlFor="batteryHealth" className={styles.label}>Battery Health (%)</label>
                <input type="number" id="batteryHealth" name="batteryHealth" className={styles.input} placeholder="e.g. 95" min="1" max="100" />
              </div>
            )}
            {category === "Laptop" && (
              <div className={styles.row}>
                <div className={styles.formGroup}>
                  <label htmlFor="ram" className={styles.label}>RAM</label>
                  <input type="text" id="ram" name="ram" className={styles.input} placeholder="e.g. 16GB" />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="storage" className={styles.label}>Storage</label>
                  <input type="text" id="storage" name="storage" className={styles.input} placeholder="e.g. 512GB SSD" />
                </div>
              </div>
            )}
            {category !== "Phone" && category !== "Laptop" && (
              <p className={styles.sectionSubtitle}>No additional technical specifications required for {category}.</p>
            )}
          </div>
        )}

        {/* Images Card */}
        <div className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Images</h2>
            <p className={styles.sectionSubtitle}>Upload up to 5 high-quality images of the product.</p>
          </div>
          
          <div 
            className={styles.dropzone}
            onClick={() => fileInputRef.current?.click()}
          >
            <UploadCloud size={32} color="var(--text-muted)" style={{ marginBottom: '8px' }} />
            <span className={styles.dropzoneText}>Click to upload images</span>
            <span className={styles.dropzoneSubtext}>JPG, PNG, WebP up to 5MB</span>
            <input 
              type="file" 
              multiple 
              accept="image/*" 
              className={styles.fileInput} 
              ref={fileInputRef}
              onChange={handleImageChange}
            />
          </div>
          
          {images.length > 0 && (
            <div className={styles.imagePreviewContainer}>
              {images.map((file, index) => (
                <div key={index} className={styles.imagePreview}>
                  <img 
                    src={URL.createObjectURL(file)} 
                    alt={`Preview ${index}`} 
                    className={styles.imageThumbnail} 
                  />
                  <button 
                    type="button" 
                    className={styles.removeImageBtn} 
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage(index);
                    }}
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={styles.submitActionRow}>
          <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Save Product"}
          </button>
        </div>
      </form>
    </div>
  );
}
