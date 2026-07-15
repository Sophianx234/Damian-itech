"use client";

import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useCartStore } from '@/store/useCartStore';
import Header from '../Header/Header';
import Footer from '../Footer/Footer';
import DealOfTheDay from '../DealOfTheDay/DealOfTheDay';

export default function MainLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    // Hydrate persistent cart
    useCartStore.persist.rehydrate();
    // Fetch global settings
    useSettingsStore.getState().fetchSettings();
  }, []);

  const isAdmin = pathname?.startsWith('/admin');
  const isAuth = pathname === '/login' || pathname === '/signup' || pathname === '/forgot-password' || pathname === '/reset-password' || pathname?.startsWith('/admin-accept-invite');

  if (isAdmin || isAuth) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      <DealOfTheDay />
      <main className="main-content">
        {children}
      </main>
      <Footer />
    </>
  );
}
