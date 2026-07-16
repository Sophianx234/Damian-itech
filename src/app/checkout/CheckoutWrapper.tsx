"use client";

import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

const CheckoutClient = dynamic(() => import('./CheckoutClient'), {
  ssr: false,
  loading: () => (
    <div style={{ height: '100vh', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Loader2 className="animate-spin" size={32} />
    </div>
  )
});

export default function CheckoutWrapper() {
  return <CheckoutClient />;
}
