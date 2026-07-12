"use client";

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Header from '../Header/Header';
import Footer from '../Footer/Footer';
import DealOfTheDay from '../DealOfTheDay/DealOfTheDay';

export default function MainLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <>{children}</>;
  }

  const isAdmin = pathname?.startsWith('/admin');
  const isAuth = pathname === '/login' || pathname === '/register' || pathname?.startsWith('/admin-accept-invite');

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
