import React from 'react';


import WishlistClient from './WishlistClient';

export default function WishlistPage() {
  return (
    <>
      <main style={{ minHeight: '80vh', backgroundColor: 'var(--bg-primary)' }}>
        <WishlistClient />
      </main>
      </>
  );
}
