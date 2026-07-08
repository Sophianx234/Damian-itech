"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './AboutFaq.module.css';

const faqs = [
  {
    question: "How can I place an order?",
    answer: "Simply browse our catalog, add your desired items to the cart, and proceed to checkout. You can check out as a guest or create an account to easily track your orders and save your preferences."
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit and debit cards (Visa, MasterCard, American Express), Apple Pay, Google Pay, and secure local payment gateways. We also offer flexible financing options on eligible orders."
  },
  {
    question: "How long does delivery take?",
    answer: "Standard delivery typically takes 3-5 business days. We also offer expedited 1-2 day shipping at checkout for urgent orders. Once your order ships, you will receive a tracking link via email."
  },
  {
    question: "Do you offer refunds or returns?",
    answer: "Yes, we offer a hassle-free 30-day return policy. If you are not completely satisfied with your purchase, you can return it in its original condition for a full refund or exchange."
  },
  {
    question: "Is my personal information safe?",
    answer: "Absolutely. Our platform utilizes bank-level SSL encryption to ensure that all your personal and payment information is securely processed and strictly protected."
  },
  {
    question: "How does the device swap program work?",
    answer: "Our tech swap program allows you to trade in your pre-loved electronics for store credit or direct exchanges. Simply list your device, receive an estimated valuation, and finalize the swap with our team."
  },
  {
    question: "How can I contact customer support?",
    answer: "Our dedicated support team is available 24/7. You can reach out via the live chat widget on our website, or email us at support@ancorexhub.com. We typically respond within an hour."
  }
];

const AboutFaq = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const toggleAccordion = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section className={styles.section}>
      <div className={`container ${styles.container}`}>
        
        {/* About Section */}
        <div className={styles.aboutWrapper}>
          <div className={styles.aboutTag}>About AncoreXHub</div>
          <h2 className={styles.aboutTitle}>Empowering Your Tech Lifestyle.</h2>
          <p className={styles.aboutDescription}>
            AncoreXHub is your premier destination for high-end electronics, immersive gadgets, and seamless tech-trading. We believe technology should be accessible, sustainable, and empowering. 
          </p>
          <p className={styles.aboutDescription}>
            Whether you're upgrading to the latest smartphone, finding the perfect smart home integration, or swapping your pre-loved devices, AncoreXHub delivers unparalleled quality, transparent pricing, and a frictionless shopping experience. Elevate your digital world with us today.
          </p>
        </div>

        {/* FAQ Section */}
        <div className={styles.faqWrapper}>
          <h2 className={styles.faqTitle}>Frequently Asked Questions</h2>
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
                        transition={{ duration: 0.3, ease: "circOut" }}
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
                        transition={{ duration: 0.3, ease: "easeInOut" }}
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
