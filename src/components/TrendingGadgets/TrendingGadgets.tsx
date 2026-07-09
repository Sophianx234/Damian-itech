"use client";

import React, { useEffect, useCallback, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import styles from './TrendingGadgets.module.css';

const devices = [
  { id: 1, name: 'PlayStation 5', image: 'imgs/gadgets/p-1.jpg' },
  { id: 2, name: 'Smart TV 4K', image: 'imgs/gadgets/tv-1.jpg' },
  { id: 3, name: 'iPhone 15 Pro', image: 'imgs/gadgets/iphone-1.png' },
  { id: 4, name: 'VR Headset', image: 'imgs/gadgets/vr-1.jpg' },
  { id: 5, name: 'Nintendo Switch', image: 'imgs/gadgets/n-1.jpg' },
  { id: 6, name: 'MacBook Pro', image: 'imgs/gadgets/mac-1.jpg' },
  { id: 7, name: 'Xbox Series X', image: 'imgs/gadgets/xbox-1.jpg' },
  { id: 8, name: 'iPad Air', image: 'imgs/gadgets/ipad-1.jpg' }
];

const TrendingGadgets = () => {
  // Using Embla Carousel with Autoplay for the "slide horizontally, stop, and slide again" mechanic
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: 'center', startIndex: 3, skipSnaps: false },
    [Autoplay({ delay: 3500, stopOnInteraction: false, stopOnMouseEnter: true })]
  );

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const onInit = useCallback((api: any) => {
    setScrollSnaps(api.scrollSnapList());
  }, []);

  const onSelect = useCallback((api: any) => {
    setSelectedIndex(api.selectedScrollSnap());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    onInit(emblaApi);
    onSelect(emblaApi);
    emblaApi.on('reInit', onInit);
    emblaApi.on('reInit', onSelect);
    emblaApi.on('select', onSelect);
  }, [emblaApi, onInit, onSelect]);

  const scrollTo = useCallback((index: number) => {
    emblaApi && emblaApi.scrollTo(index);
  }, [emblaApi]);

  return (
    <section className={styles.section}>
      <div className="container">
        <h2 className={styles.sectionTitle}>Trending Tech Arsenal</h2>
        
        <div className={styles.carouselWrapper}>
          <div className={styles.embla} ref={emblaRef}>
            <div className={styles.emblaContainer}>
              {devices.map(device => (
                <div key={device.id} className={styles.emblaSlide}>
                  <div className={styles.cardWrapper}>
                    <div className={styles.card}>
                      <div className={styles.cardInner}>
                        <img src={device.image} alt={device.name} className={styles.image} />
                      </div>
                    </div>
                    <h3 className={styles.deviceName}>{device.name}</h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className={styles.dots}>
            {scrollSnaps.map((_, index) => (
              <button
                key={index}
                className={`${styles.dot} ${index === selectedIndex ? styles.dotActive : ''}`}
                onClick={() => scrollTo(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

export default TrendingGadgets;
