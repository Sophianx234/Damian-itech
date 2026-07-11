import React from 'react';
import Header from '../../../components/Header/Header';
import Footer from '../../../components/Footer/Footer';
import styles from './ProductDetails.module.css';
import ProductDetailsClient from './ProductDetailsClient';
import dbConnect from '@/lib/mongodb';
import ProductModel from '@/models/Product';
import { notFound } from 'next/navigation';

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  await dbConnect();
  
  const product = await ProductModel.findOne({ slug }).lean();
  
  if (!product) {
    return (
      <>
        <Header />
        <main className={styles.main}>
          <div className={`container ${styles.container}`} style={{ textAlign: 'center', paddingTop: '100px' }}>
            <h1>Product Not Found</h1>
            <p>The product you are looking for does not exist.</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // Ensure JSON serialization of ObjectId
  const productJson = JSON.parse(JSON.stringify(product));

  const relatedProducts = await ProductModel.find({ 
    category: product.category, 
    _id: { $ne: product._id },
    status: 'Active'
  }).limit(4).lean();
  
  const relatedProductsJson = JSON.parse(JSON.stringify(relatedProducts));

  return (
    <>
      <Header />
      <main className={styles.main}>
        <ProductDetailsClient product={productJson} relatedProducts={relatedProductsJson} />
      </main>
      <Footer />
    </>
  );
}
