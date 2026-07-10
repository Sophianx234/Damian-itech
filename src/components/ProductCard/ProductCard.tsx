import React from 'react';
import styles from './ProductCard.module.css';

export interface ProductCardProps {
  id: number | string;
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
}

const ProductCard: React.FC<ProductCardProps> = ({
  name,
  image,
  tag,
  tagType,
  variant = 'shop',
  price,
  oldPrice,
  estValue,
  lookingFor
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

  return (
    <div className={styles.card}>
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
              <span className={oldPrice ? styles.salePrice : styles.price}>{price}</span>
              {oldPrice && <span className={styles.oldPrice}>{oldPrice}</span>}
            </div>
            <button className={`btn-primary ${styles.btn}`}>Shop Now</button>
          </>
        ) : (
          <>
            <div className={styles.valueRow}>
              <span className={styles.valueLabel}>Est. Value: <span className={styles.price}>{estValue}</span></span>
              <span className={styles.valueLabel}>Wants: <strong>{lookingFor}</strong></span>
            </div>
            <button className={`btn-primary ${styles.swapBtn}`}>Propose Swap</button>
          </>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
