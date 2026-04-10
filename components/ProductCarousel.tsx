'use client';

import { useState, useRef, useEffect } from 'react';
import styles from './ProductCarousel.module.css';

interface Product {
  id: string;
  name: string;
  price: number;
  gradient?: string;
  badge?: string;
}

interface ProductCarouselProps {
  title: string;
  products?: Product[];
}

const DEFAULT_PRODUCTS: Product[] = [
  { id: '1', name: 'Rose Bouquet', price: 29.99, gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', badge: 'Bestseller' },
  { id: '2', name: 'Tulip Mix', price: 24.99, gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
  { id: '3', name: 'Lily Arrangement', price: 34.99, gradient: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)', badge: 'New' },
  { id: '4', name: 'Sunflower Bunch', price: 19.99, gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)' },
  { id: '5', name: 'Orchid Plant', price: 49.99, gradient: 'linear-gradient(135deg, #ff9a56 0%, #ff6a88 100%)' },
];

export default function ProductCarousel({ title, products = DEFAULT_PRODUCTS }: ProductCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [addedItems, setAddedItems] = useState<Set<string>>(new Set());
  const trackRef = useRef<HTMLDivElement>(null);

  const cardWidth = 300;
  const visibleCards = 3;
  const maxIndex = Math.max(0, products.length - visibleCards);

  const nextSlide = () => {
    setCurrentIndex((prev) => Math.min(prev + 1, maxIndex));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  const addToCart = (productId: string) => {
    setAddedItems((prev) => new Set(prev).add(productId));
    setTimeout(() => {
      setAddedItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }, 2000);
  };

  useEffect(() => {
    if (trackRef.current) {
      trackRef.current.style.transform = `translateX(-${currentIndex * cardWidth}px)`;
    }
  }, [currentIndex]);

  return (
    <div className={styles.carousel}>
      <h2 className={styles.title}>{title}</h2>
      <div className={styles.container}>
        <button 
          className={`${styles.arrow} ${styles.left}`} 
          onClick={prevSlide}
          disabled={currentIndex === 0}
        >
          ‹
        </button>
        <div className={styles.trackContainer}>
          <div className={styles.track} ref={trackRef}>
            {products.map((product) => (
              <div key={product.id} className={styles.card}>
                <div className={styles.imageContainer} style={{ background: product.gradient }}>
                  {product.badge && <span className={styles.badge}>{product.badge}</span>}
                  <div className={styles.overlay}>
                    <button className={styles.quickView}>Quick View</button>
                  </div>
                </div>
                <div className={styles.info}>
                  <h3>{product.name}</h3>
                  <p className={styles.price}>${product.price}</p>
                  <button 
                    className={`${styles.addToCart} ${addedItems.has(product.id) ? styles.added : ''}`}
                    onClick={() => addToCart(product.id)}
                  >
                    {addedItems.has(product.id) ? 'Added ✓' : 'Add to Cart'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <button 
          className={`${styles.arrow} ${styles.right}`} 
          onClick={nextSlide}
          disabled={currentIndex === maxIndex}
        >
          ›
        </button>
      </div>
    </div>
  );
}