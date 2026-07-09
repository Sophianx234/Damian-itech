import React from 'react';
import Header from '../components/Header/Header';
import HeroCarousel from '../components/HeroCarousel/HeroCarousel';
import FeaturesBar from '../components/FeaturesBar/FeaturesBar';
import TrendingGadgets from '../components/TrendingGadgets/TrendingGadgets';
import FeaturedProducts from '../components/FeaturedProducts/FeaturedProducts';
import SwapItems from '../components/SwapItems/SwapItems';
import PromoBanner from '../components/PromoBanner/PromoBanner';
import Categories from '../components/Categories/Categories';
import Footer from '../components/Footer/Footer';

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <HeroCarousel />
        <FeaturesBar />
        <TrendingGadgets />
        <FeaturedProducts />
        <SwapItems />
        <PromoBanner />
        <Categories />
      </main>
      <Footer />
    </>
  );
}
