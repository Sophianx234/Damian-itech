import React from 'react';
import Link from 'next/link';
import styles from './ProductCard.module.css';

export interface ProductCardProps {
  id: number | string;
  slug: string;
  name: string;
  image: string;
  tag?: string | null;
  tagType?: 'sale' | 'new' | 'condition' | 'wanted' | string | null;
  variant?: 'shop' | 'swap';
  
  // Shop props
  price?: string;
  oldPrice?: string | null;
  
  // Swap props
  estValue?: string;
  lookingFor?: string;
  
  // Inventory
  stock?: number;
}

const ProductCard: React.FC<ProductCardProps> = ({
  slug,
  name,
  image,
  tag,
  tagType,
  variant = 'shop',
  price,
  oldPrice,
  estValue,
  lookingFor,
  stock
}) => {
  
  const getTagClass = () => {
    switch(tagType) {
      case 'sale': return styles.tagSale;
      case 'new': return styles.tagNew;
      case 'wanted': return styles.tagWanted;
      case 'condition': return styles.tagCondition;
      default: return styles.tagNew;
    }
  };

  const formatPriceStr = (val?: string | null) => {
    if (!val) return null;
    const match = val.match(/^([^\d]*)([\d,.]+)([^\d]*)$/);
    if (match) {
      const prefix = match[1];
      const numberPart = parseFloat(match[2].replace(/,/g, ''));
      const suffix = match[3];
      if (!isNaN(numberPart)) {
        return `${prefix}${numberPart.toLocaleString("en-US", { maximumFractionDigits: 2 })}${suffix}`;
      }
    }
    return val;
  };

  const formattedPrice = formatPriceStr(price);
  const formattedOldPrice = formatPriceStr(oldPrice);
  const formattedEstValue = formatPriceStr(estValue);

  return (
    <Link href={`/products/${slug}`} className={styles.card}>
      <div className={styles.imageWrapper}>
        {tag && (
          <span className={`${styles.tag} ${getTagClass()}`}>
            {tag}
          </span>
        )}
        <img src={image} alt={name} className={styles.productImage} />
      </div>
      
      <div className={styles.productInfo}>
        <h3 className={styles.productName}>{name}</h3>
        
        {variant === 'shop' ? (
          <>
            <div className={styles.priceRow}>
              <span className={formattedOldPrice ? styles.salePrice : styles.price}>{formattedPrice}</span>
              {formattedOldPrice && <span className={styles.oldPrice}>{formattedOldPrice}</span>}
            </div>
            <button className={`btn-primary ${styles.btn}`}>Shop Now</button>
          </>
        ) : (
          <>
            <div className={styles.valueRow}>
              {formattedEstValue && <span className={styles.valueLabel}>Est. Value: <span className={styles.price}>{formattedEstValue}</span></span>}
              {lookingFor && <span className={styles.valueLabel}>Wants: <strong>{lookingFor}</strong></span>}
            </div>
            <button className={`btn-primary ${styles.swapBtn}`}>Propose Swap</button>
          </>
        )}
        {stock !== undefined && (
          <div style={{ marginTop: '8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {stock > 0 ? `${stock} in stock` : 'Out of stock'}
          </div>
        )}
      </div>
    </Link>
  );
};

export default ProductCard;
