"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Shield, Truck, HeadphonesIcon, Award } from "lucide-react";
import MainLayoutWrapper from "@/components/MainLayoutWrapper/MainLayoutWrapper";
import styles from "./About.module.css";

export default function AboutPage() {
  const values = [
    {
      title: "Premium Curated Selection",
      description: "We don't just sell electronics. We hand-pick the finest, highest-performing hardware globally so you never have to guess.",
      icon: <Award className={styles.valueIcon} size={28} />
    },
    {
      title: "Uncompromising Quality",
      description: "Every item in our inventory undergoes rigorous quality checks. We strictly partner with authorized distributors.",
      icon: <Shield className={styles.valueIcon} size={28} />
    },
    {
      title: "Lightning Fast Delivery",
      description: "Time is your most valuable asset. Our robust logistics network ensures your next upgrade reaches your door in record time.",
      icon: <Truck className={styles.valueIcon} size={28} />
    },
    {
      title: "24/7 Elite Support",
      description: "Tech issues don't follow a schedule, and neither do we. Our expert support team is always available to assist you.",
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

        {/* CTA Section */}
        <section className={styles.ctaSection}>
          <div className="container">
            <div className={styles.ctaBox}>
              <h2 className={styles.ctaTitle}>Ready to get your tech product?</h2>
              <p className={styles.ctaSubtitle}>Explore our latest curated collection of high-performance devices.</p>
              <div className={styles.ctaButtons}>
                <Link href="/shop" className={styles.primaryBtn}>
                  Shop Now
                </Link>
                <Link href="/contact" className={styles.secondaryBtn}>
                  Contact Us
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
  );
}
