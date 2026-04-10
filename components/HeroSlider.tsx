'use client';

import { useState, useEffect } from 'react';
import styles from './HeroSlider.module.css';

const DEFAULT_SLIDES = [
  {
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    headline: 'Welcome to Petale',
    subheadline: 'Beautiful flowers for every occasion',
    cta: 'Shop Now',
    ctaLink: '/shop'
  },
  {
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    headline: 'Fresh Blooms Daily',
    subheadline: 'Hand-picked and delivered fresh',
    cta: 'Learn More',
    ctaLink: '/about'
  },
  {
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    headline: 'Special Offers',
    subheadline: 'Up to 50% off on selected items',
    cta: 'View Deals',
    ctaLink: '/deals'
  }
];

export default function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % DEFAULT_SLIDES.length);
    }, 5500);

    return () => clearInterval(timer);
  }, [isPaused]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % DEFAULT_SLIDES.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + DEFAULT_SLIDES.length) % DEFAULT_SLIDES.length);
  };

  return (
    <div 
      className={styles.slider}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {DEFAULT_SLIDES.map((slide, index) => (
        <div
          key={index}
          className={`${styles.slide} ${index === currentSlide ? styles.active : ''}`}
          style={{ background: slide.gradient }}
        >
          <div className={styles.overlay}>
            <div className={styles.content}>
              <h1>{slide.headline}</h1>
              <p>{slide.subheadline}</p>
              <a href={slide.ctaLink} className={styles.cta}>
                {slide.cta}
              </a>
            </div>
          </div>
        </div>
      ))}

      <button className={`${styles.arrow} ${styles.left}`} onClick={prevSlide}>
        ‹
      </button>
      <button className={`${styles.arrow} ${styles.right}`} onClick={nextSlide}>
        ›
      </button>

      <div className={styles.dots}>
        {DEFAULT_SLIDES.map((_, index) => (
          <button
            key={index}
            className={`${styles.dot} ${index === currentSlide ? styles.active : ''}`}
            onClick={() => goToSlide(index)}
          />
        ))}
      </div>

      <div className={styles.progress}>
        <div 
          className={styles.progressBar}
          style={{ width: `${((currentSlide + 1) / DEFAULT_SLIDES.length) * 100}%` }}
        />
      </div>
    </div>
  );
}