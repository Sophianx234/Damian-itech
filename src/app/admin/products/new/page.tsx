"use client";

import React, { useState, useRef, useActionState, startTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, UploadCloud, X } from "lucide-react";
import styles from "./NewProduct.module.css";
import { createProductAction, ActionState } from "./actions";

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
  const [customSpecs, setCustomSpecs] = useState<{ key: string; value: string }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [state, dispatch] = useActionState(createProductAction, {
    errors: {},
    message: "",
    success: undefined
  });
  
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

  const addCustomSpec = () => {
    setCustomSpecs(prev => [...prev, { key: "", value: "" }]);
  };

  const updateCustomSpec = (index: number, field: "key" | "value", newValue: string) => {
    setCustomSpecs(prev => {
      const updated = [...prev];
      updated[index][field] = newValue;
      return updated;
    });
  };

  const removeCustomSpec = (index: number) => {
    setCustomSpecs(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const form = e.currentTarget;
    const title = (form.elements.namedItem("title") as HTMLInputElement).value;
    const slug = slugify(title);

    const tag = (form.elements.namedItem("tag") as HTMLInputElement)?.value;
    const tagType = (form.elements.namedItem("tagType") as HTMLSelectElement)?.value;
    const oldPrice = (form.elements.namedItem("oldPrice") as HTMLInputElement)?.value;
    const estValue = (form.elements.namedItem("estValue") as HTMLInputElement)?.value;
    const lookingFor = (form.elements.namedItem("lookingFor") as HTMLInputElement)?.value;

    try {
      // 1. Fetch Cloudinary Signature
      const signRes = await fetch("/api/cloudinary/sign");
      if (!signRes.ok) throw new Error("Failed to get upload signature");
      const { timestamp, signature, apiKey, cloudName, folder } = await signRes.json();

      // 2. Upload Images to Cloudinary client-side
      const uploadedImageUrls: string[] = [];
      for (const file of images) {
        const uploadData = new FormData();
        uploadData.append("file", file);
        uploadData.append("api_key", apiKey);
        uploadData.append("timestamp", timestamp);
        uploadData.append("signature", signature);
        uploadData.append("folder", folder);

        const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: "POST",
          body: uploadData,
        });
        
        if (!uploadRes.ok) throw new Error("Failed to upload image");
        const cloudinaryData = await uploadRes.json();
        uploadedImageUrls.push(cloudinaryData.secure_url);
      }

      // 3. Dispatch to Server Action instead of raw fetch
      const productData = new FormData(form);
      productData.set("slug", slug);
      productData.set("isSwappable", String(isSwappable));
      productData.set("customSpecs", JSON.stringify(customSpecs));
      productData.set("imageUrls", JSON.stringify(uploadedImageUrls));
      
      if (isSwappable) {
        const estVal = (form.elements.namedItem("estValue") as HTMLInputElement)?.value;
        const lfVal = (form.elements.namedItem("lookingFor") as HTMLInputElement)?.value;
        if (estVal) productData.set("estValue", estVal);
        if (lfVal) productData.set("lookingFor", lfVal);
      } else {
        productData.delete("estValue");
        productData.delete("lookingFor");
      }

      startTransition(() => {
        dispatch(productData);
        setIsSubmitting(false); // form will re-enable, but server action is processing
      });
      
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
            <input 
              type="text" 
              id="title" 
              name="title" 
              className={`${styles.input} ${state.errors?.title ? styles.inputError : ""}`} 
              placeholder="e.g. iPhone 15 Pro Max" 
            />
            {state.errors?.title && <span className={styles.errorText}>{state.errors.title[0]}</span>}
          </div>
          <div className={styles.row}>
            {!isSwappable && (
              <>
                <div className={styles.formGroup}>
                  <label htmlFor="price" className={styles.label}>Price</label>
                  <input type="number" id="price" name="price" required={!isSwappable} className={styles.input} placeholder="e.g. 1199" />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="oldPrice" className={styles.label}>Old Price (Optional)</label>
                  <input type="number" id="oldPrice" name="oldPrice" className={styles.input} placeholder="e.g. 1299" />
                </div>
              </>
            )}
            <div className={styles.formGroup}>
              <label htmlFor="stock" className={styles.label}>Stock Quantity</label>
              <input type="number" id="stock" name="stock" required className={styles.input} placeholder="e.g. 5" defaultValue={1} min={0} />
            </div>
          </div>
          <div className={styles.row}>
            <div className={styles.formGroup}>
              <label htmlFor="brand" className={styles.label}>Brand</label>
              <input 
                type="text" 
                id="brand" 
                name="brand" 
                className={`${styles.input} ${state.errors?.brand ? styles.inputError : ""}`} 
                placeholder="e.g. Apple" 
              />
              {state.errors?.brand && <span className={styles.errorText}>{state.errors.brand[0]}</span>}
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="category" className={styles.label}>Category</label>
              <select 
                id="category" 
                name="category" 
                className={`${styles.select} ${state.errors?.category ? styles.inputError : ""}`} 
                value={category} 
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="" disabled>Select Category</option>
                <option value="Phone">Phone</option>
                <option value="Laptop">Laptop</option>
                <option value="Console">Console</option>
                <option value="Audio">Audio</option>
              </select>
            </div>
          </div>
          <div className={styles.row}>
            <div className={styles.formGroup}>
              <label htmlFor="vendorName" className={styles.label}>Vendor Name</label>
              <input type="text" id="vendorName" name="vendorName" className={styles.input} placeholder="e.g. Tech Haven (Optional)" />
            </div>
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="description" className={styles.label}>Description</label>
            <textarea 
              id="description" 
              name="description" 
              className={`${styles.textarea} ${state.errors?.description ? styles.inputError : ""}`} 
              placeholder="Detailed product description..." 
              rows={4}
            ></textarea>
            {state.errors?.description && <span className={styles.errorText}>{state.errors.description[0]}</span>}
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
                Used (Market)
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
            <input type="checkbox" name="isSwappable" checked={isSwappable} readOnly className={styles.checkboxInput} />
            <label className={styles.checkboxLabel}>Available for Swapping</label>
          </div>

          {isSwappable && (
            <div className={styles.row} style={{ marginTop: '16px' }}>
              <div className={styles.formGroup}>
                <label htmlFor="estValue" className={styles.label}>Estimated Value</label>
                <input type="number" id="estValue" name="estValue" className={styles.input} placeholder="e.g. 1000" required />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="lookingFor" className={styles.label}>Looking For</label>
                <input type="text" id="lookingFor" name="lookingFor" className={styles.input} placeholder="e.g. iPhone 13 Pro" required />
              </div>
            </div>
          )}
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

            {/* Custom Specifications */}
            <div className={styles.customSpecsContainer}>
              {customSpecs.map((spec, index) => (
                <div key={index} className={styles.customSpecRow}>
                  <div className={styles.formGroup}>
                    <input 
                      type="text" 
                      placeholder="e.g. Color" 
                      className={styles.input} 
                      value={spec.key}
                      onChange={(e) => updateCustomSpec(index, "key", e.target.value)}
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <input 
                      type="text" 
                      placeholder="e.g. Space Black" 
                      className={styles.input} 
                      value={spec.value}
                      onChange={(e) => updateCustomSpec(index, "value", e.target.value)}
                      required
                    />
                  </div>
                  <button 
                    type="button" 
                    className={styles.removeSpecBtn} 
                    onClick={() => removeCustomSpec(index)}
                    aria-label="Remove specification"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
              
              <button 
                type="button" 
                className={styles.addSpecBtn} 
                onClick={addCustomSpec}
              >
                + Add Custom Specification
              </button>
            </div>
          </div>
        )}

        {/* Marketing Card */}
        <div className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Marketing & Badges</h2>
            <p className={styles.sectionSubtitle}>Add promotional tags like "Sale" or "New" to appear on the product card.</p>
          </div>
          <div className={styles.row}>
            <div className={styles.formGroup}>
              <label htmlFor="tag" className={styles.label}>Badge Text</label>
              <input type="text" id="tag" name="tag" className={styles.input} placeholder="e.g. Sale, New, -10%" />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="tagType" className={styles.label}>Badge Color Style</label>
              <select id="tagType" name="tagType" className={styles.select} defaultValue="">
                <option value="" disabled>Select Style</option>
                <option value="sale">Sale (Red)</option>
                <option value="new">New (Blue/Green)</option>
                <option value="discount">Discount (Purple)</option>
              </select>
            </div>
          </div>
        </div>

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
            {isSubmitting && <Loader2 className={styles.spin} size={20} />}
            {isSubmitting ? "Creating..." : "Create Product"}
          </button>
        </div>
      </form>
    </div>
  );
}
