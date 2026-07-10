import React from 'react';
import styles from './FeaturedProducts.module.css';
import ProductCard from '../ProductCard/ProductCard';

const products = [
  {
    id: 1,
    name: 'Wireless Earbuds',
    price: '$89.99',
    oldPrice: null,
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    tag: 'New',
    tagType: 'new'
  },
  {
    id: 2,
    name: 'Smartwatch Pro',
    price: '$199.00',
    oldPrice: null,
    image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    tag: null,
    tagType: null
  },
  {
    id: 3,
    name: 'Portable Bluetooth Speaker',
    price: '$129.00',
    oldPrice: null,
    image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    tag: null,
    tagType: null
  },
  {
    id: 5,
    name: 'Portable Bluetooth Speaker Bluetooth Speaker Bluetooth Speaker',
    price: '$129.00',
    oldPrice: null,
    image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    tag: null,
    tagType: null
  },
  {
    id: 4,
    name: 'Gaming Mouse',
    price: '$49.99',
    oldPrice: '$59.99',
    image: 'https://images.unsplash.com/photo-1527814050087-179f0011ab33?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    tag: 'Sale',
    tagType: 'sale'
  }
];

const FeaturedProducts = () => {
  return (
    <section className={styles.section}>
      <div className="container">
        <h2 className={styles.sectionTitle}>Featured Products</h2>
        <div className={styles.grid}>
          {products.map(product => (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              image={product.image}
              price={product.price}
              oldPrice={product.oldPrice}
              tag={product.tag}
              tagType={product.tagType}
              variant="shop"
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
