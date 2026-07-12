import React from 'react';
import HeroCarousel from '../components/HeroCarousel/HeroCarousel';
import FeaturesBar from '../components/FeaturesBar/FeaturesBar';
import TrendingGadgets from '../components/TrendingGadgets/TrendingGadgets';
import FeaturedProducts from '../components/FeaturedProducts/FeaturedProducts';
import SwapItems from '../components/SwapItems/SwapItems';
import PromoBanner from '../components/PromoBanner/PromoBanner';
import Categories from '../components/Categories/Categories';
import AboutFaq from '../components/AboutFaq/AboutFaq';

export default function Home() {
  return (
    <main>
      <HeroCarousel />
      <FeaturesBar />
      <TrendingGadgets />
      <FeaturedProducts />
      <SwapItems />
      <PromoBanner />
      <Categories />
      <AboutFaq />
    </main>
  );
}
