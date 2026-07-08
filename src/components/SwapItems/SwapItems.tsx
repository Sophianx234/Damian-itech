import React from 'react';
import styles from './SwapItems.module.css';

const swapItems = [
  {
    id: 1,
    name: 'Mechanical Keyboard (Cherry MX Blue)',
    estValue: '$80.00',
    image: 'https://images.unsplash.com/photo-1595225476474-87563907a212?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    tag: 'Like New',
    tagType: 'condition',
    lookingFor: 'Gaming Mouse'
  },
  {
    id: 2,
    name: '4K Monitor 27"',
    estValue: '$250.00',
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    tag: 'Good',
    tagType: 'condition',
    lookingFor: 'iPad or Tablet'
  },
  {
    id: 3,
    name: 'Noise Cancelling Headphones',
    estValue: '$150.00',
    image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    tag: 'Seeking Phone',
    tagType: 'wanted',
    lookingFor: 'Smartphone'
  },
  {
    id: 4,
    name: 'Mirrorless Camera Body',
    estValue: '$600.00',
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    tag: 'Excellent',
    tagType: 'condition',
    lookingFor: 'Drone'
  },
  {
    id: 5,
    name: 'Vintage Film Camera',
    estValue: '$120.00',
    image: 'https://images.unsplash.com/photo-1512790182412-b19e6d62bc39?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    tag: 'Fair',
    tagType: 'condition',
    lookingFor: 'Any Tech'
  }
];

const SwapItems = () => {
  return (
    <section className={styles.section}>
      <div className="container">
        <h2 className={styles.sectionTitle}>Available for Swap</h2>
        <div className={styles.grid}>
          {swapItems.map(item => (
            <div key={item.id} className={styles.card}>
              <div className={styles.imageWrapper}>
                {item.tag && (
                  <span className={`${styles.tag} ${item.tagType === 'wanted' ? styles.tagWanted : styles.tagCondition}`}>
                    {item.tag}
                  </span>
                )}
                <img src={item.image} alt={item.name} className={styles.productImage} />
              </div>
              <div className={styles.productInfo}>
                <h3 className={styles.productName}>{item.name}</h3>
                <div className={styles.valueRow}>
                  <span className={styles.valueLabel}>Est. Value: <span className={styles.price}>{item.estValue}</span></span>
                  <span className={styles.valueLabel}>Wants: <strong>{item.lookingFor}</strong></span>
                </div>
                <button className={`btn-primary ${styles.swapBtn}`}>Propose Swap</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SwapItems;
