import React from 'react';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import WishlistClient from './WishlistClient';

export default function WishlistPage() {
  return (
    <>
      <Header />
      <main style={{ minHeight: '80vh', backgroundColor: 'var(--bg-primary)' }}>
        <WishlistClient />
      </main>
      <Footer />
    </>
  );
}
