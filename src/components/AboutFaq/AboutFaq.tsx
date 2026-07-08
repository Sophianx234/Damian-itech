"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './AboutFaq.module.css';

const faqs = [
  {
    question: "How can I place an order?",
    answer: "Browse our premium catalog, select your desired products, add them to your cart, and proceed to our secure checkout for a seamless experience."
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit and debit cards, secure Mobile Money transfers, and leading digital wallets to provide you with ultimate flexibility."
  },
  {
    question: "How long does delivery take?",
    answer: "Delivery timeframes vary based on your location. A precise, dynamically calculated delivery estimate is provided at checkout before you finalize your order."
  },
  {
    question: "Do you offer refunds or returns?",
    answer: "Yes, we uphold a hassle-free return policy. Eligible items can be returned or exchanged effortlessly to ensure your complete satisfaction."
  },
  {
    question: "Is my personal information safe?",
    answer: "Absolutely. We implement robust data security measures, including bank-grade encryption, to ensure your privacy and payment data remain strictly protected."
  }
];

const seoBlocks = [
  {
    title: "The Ultimate Tech Hub",
    desc: "Experience the pinnacle of digital commerce. AncoreXHub bridges the gap between cutting-edge technology and unparalleled convenience, offering a frictionless ecosystem for premium shopping and trading."
  },
  {
    title: "Gadgets & Electronics",
    desc: "From flagship smartphones to high-performance computing and immersive audio, discover a curated selection of devices engineered for modern, high-speed living."
  },
  {
    title: "Home & Appliances",
    desc: "Elevate your living space with intelligent home appliances designed for uncompromising efficiency, sustainability, and effortless control over your environment."
  },
  {
    title: "Lifestyle & Beauty",
    desc: "Explore our refined collection of lifestyle accessories and wellness tools that seamlessly complement your sophisticated aesthetic and daily routines."
  }
];

const AboutFaq = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const toggleAccordion = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section className={styles.section}>
      <div className="container">
        
        {/* Asymmetric SEO / Category Showcase */}
        <div className={styles.showcaseWrapper}>
          <div className={styles.showcaseHeader}>
            <span className={styles.showcaseTag}>The Best Online Shopping Site in Ghana</span>
            {/* <h2 className={styles.showcaseTitle}>Curating the Future of Retail.</h2> */}
          </div>
          
          <div className={styles.seoGrid}>
            {seoBlocks.map((block, index) => (
              <div key={index} className={styles.seoBlock}>
                <h3 className={styles.seoBlockTitle}>{block.title}</h3>
                <p className={styles.seoBlockDesc}>{block.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className={styles.faqWrapper}>
          <div className={styles.faqHeader}>
            <h2 className={styles.faqTitle}>Frequently Asked Questions</h2>
            <p className={styles.faqSubtitle}>Everything you need to know about shopping with us.</p>
          </div>
          
          <div className={styles.accordion}>
            {faqs.map((faq, index) => {
              const isActive = activeIndex === index;

              return (
                <div 
                  key={index} 
                  className={`${styles.accordionItem} ${isActive ? styles.active : ''}`}
                >
                  <button 
                    className={styles.accordionHeader} 
                    onClick={() => toggleAccordion(index)}
                    aria-expanded={isActive}
                  >
                    <span className={styles.question}>{faq.question}</span>
                    <span className={styles.iconWrapper}>
                      <motion.svg
                        animate={{ rotate: isActive ? 45 : 0 }}
                        transition={{ type: "spring", stiffness: 260, damping: 20 }}
                        width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                      >
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                      </motion.svg>
                    </span>
                  </button>
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 200, damping: 25, mass: 1 }}
                        className={styles.accordionContentWrapper}
                      >
                        <div className={styles.accordionContent}>
                          <p>{faq.answer}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
};

export default AboutFaq;
