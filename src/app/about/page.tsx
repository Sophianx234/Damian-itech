"use client";

import React, { useState, useEffect } from 'react';
import TeamCarousel from "@/components/TeamCarousel/TeamCarousel";
import Testimonials from "@/components/Testimonials/Testimonials";
import { Award, HeadphonesIcon, Shield, Truck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import styles from "./About.module.css";

export default function AboutPage() {
  const ctaImages = [
    "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=2000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=2000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?q=80&w=2000&auto=format&fit=crop"
  ];

  const [activeCtaIndex, setActiveCtaIndex] = useState(0);

  useEffect(() => {
    const ctaInterval = setInterval(() => {
      setActiveCtaIndex((current) => (current + 1) % ctaImages.length);
    }, 5000);
    return () => clearInterval(ctaInterval);
  }, [ctaImages.length]);

  const values = [
    {
      title: "No Clutter, Just the Best",
      description: "We hate scrolling through pages of mediocre tech just as much as you do. That’s why we do the homework, filtering out the noise so you only see gear that’s genuinely worth your money.",
      icon: <Award className={styles.valueIcon} size={28} />
    },
    {
      title: "Zero Knock-offs",
      description: "You shouldn't have to wonder if what you're buying is the real deal. We work directly with verified brands to make sure every single item you unbox is 100% authentic and ready to perform.",
      icon: <Shield className={styles.valueIcon} size={28} />
    },
    {
      title: "We Don't Like Waiting Either",
      description: "When you buy a new piece of tech, you want it yesterday. Our shipping network is built to get your next upgrade from our warehouse to your front door before the hype wears off.",
      icon: <Truck className={styles.valueIcon} size={28} />
    },
    {
      title: "Actual Humans, Actually Helping",
      description: "Got a question at 2 AM? Ran into a weird glitch? We don’t hide behind automated bots. You get direct access to real tech enthusiasts who actually care about getting your setup running perfectly.",
      icon: <HeadphonesIcon className={styles.valueIcon} size={28} />
    }
  ];

  return (
      <div className={styles.aboutContainer}>
        {/* Hero Section */}
        <section className={styles.heroSection}>
          <div className="container">
            <h1 className={styles.heroTitle}>
              Elevating your digital <br />
              <span className={styles.highlight}>lifestyle.</span>
            </h1>
            <p className={styles.heroSubtitle}>
              Damian iTech was founded with a singular, uncompromising vision: to provide a seamless, premium gateway to the world's most advanced technology.
            </p>
          </div>
        </section>

        {/* Story Section */}
        <section className={styles.storySection}>
          <div className={`container ${styles.storyGrid}`}>
            <div className={styles.storyImageWrapper}>
              <div className={styles.storyImageContainer}>
                {/* We use a high contrast dark aesthetic image representation here */}
                <Image 
                  src="/imgs/gadgets/ipad-1.jpeg" 
                  alt="Damian iTech Premium Store" 
                  fill
                  className={styles.storyImage}
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </div>
            <div className={styles.storyContent}>
              <h2 className={styles.sectionTitle}>The Damian iTech Story</h2>
              <p className={styles.storyText}>
                What started as a passionate pursuit of high-end consumer electronics has evolved into the definitive destination for tech enthusiasts. We recognized a gap in the market: retail spaces were either too generic, lacking deep product knowledge, or too exclusive, lacking accessibility.
              </p>
              <p className={styles.storyText}>
                We bridged that gap. By combining an ultra-minimalist, high-performance aesthetic with an intensely customer-first approach, we've built more than a store. We've built a curated gallery for the tools that power your modern life.
              </p>
              <div className={styles.statsContainer}>
                <div className={styles.statBox}>
                  <h3 className={styles.statNumber}>10k+</h3>
                  <p className={styles.statLabel}>Happy Customers</p>
                </div>
                <div className={styles.statBox}>
                  <h3 className={styles.statNumber}>150+</h3>
                  <p className={styles.statLabel}>Premium Brands</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className={styles.valuesSection}>
          <div className="container">
            <div className={styles.valuesHeader}>
              <h2 className={styles.sectionTitle}>Our Core Values</h2>
              <p className={styles.valuesSubtitle}>The principles that drive every decision we make.</p>
            </div>
            <div className={styles.valuesGrid}>
              {values.map((value, index) => (
                <div key={index} className={styles.valueCard}>
                  <div className={styles.iconWrapper}>
                    {value.icon}
                  </div>
                  <h3 className={styles.valueTitle}>{value.title}</h3>
                  <p className={styles.valueDescription}>{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team Section */}
        <TeamCarousel />

        {/* Testimonials Section */}
        <Testimonials />

        {/* CTA Section */}
        <section className={styles.ctaSection}>
          <div className={styles.ctaBackgroundWrapper}>
            <div 
              className={styles.ctaBackgroundTrack}
              style={{ transform: `translateX(-${activeCtaIndex * 100}%)` }}
            >
              {ctaImages.map((src, idx) => (
                <div key={idx} className={styles.ctaBackgroundImage}>
                  <Image src={src} alt="Tech Setup" fill className={styles.ctaImg} />
                </div>
              ))}
            </div>
            <div className={styles.ctaOverlay}></div>
          </div>

          <div className={`container ${styles.ctaContentContainer}`}>
            <div className={styles.ctaBox}>
              <h2 className={styles.ctaTitle}>Ready to elevate your setup?</h2>
              <p className={styles.ctaSubtitle}>Explore our latest curated collection of high-performance devices and transform your digital lifestyle.</p>
              <div className={styles.ctaButtons}>
                <Link href="/shop" className={styles.primaryBtnDark}>
                  Shop Now
                </Link>
                <Link href="/contact" className={styles.secondaryBtnDark}>
                  Contact Us
                </Link>
              </div>

              <div className={styles.ctaDots}>
                {ctaImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveCtaIndex(index)}
                    className={`${styles.ctaDot} ${index === activeCtaIndex ? styles.activeCtaDot : ''}`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
  );
}
