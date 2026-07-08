import React from 'react';
import Header from '../components/Header/Header';
import Hero from '../components/Hero/Hero';
import FeaturesBar from '../components/FeaturesBar/FeaturesBar';
import FeaturedProducts from '../components/FeaturedProducts/FeaturedProducts';
import PromoBanner from '../components/PromoBanner/PromoBanner';
import Categories from '../components/Categories/Categories';
import Footer from '../components/Footer/Footer';

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <FeaturesBar />
        <FeaturedProducts />
        <PromoBanner />
        <Categories />
      </main>
      <Footer />
    </>
  );
}
