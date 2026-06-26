'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import styles from './ProductCard.module.css';
import { ShoppingCart, Eye, Star } from 'lucide-react';

interface Props {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  badge?: string;
  rating?: number;
  reviewCount?: number;
  gradient?: string;
  colors?: string[];
  image?: string;
}

export default function ProductCard({ id, name, price, originalPrice, badge, rating = 0, reviewCount = 0, gradient, colors = [], image }: Props) {
  const { addItem } = useCart();
  const discount = originalPrice ? Math.round((1 - price / originalPrice) * 100) : 0;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({ id, name, price, quantity: 1, image });
  };

  const bg = gradient || 'linear-gradient(135deg, #6C5CE7 0%, #a29bfe 100%)';

  return (
    <Link href={`/products/${id}`} className={styles.card}>
      {/* Image Area */}
      <div className={styles.imageWrapper}>
        {image ? (
          <div className={styles.imageContainer}>
            <Image
              src={image}
              alt={name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className={styles.productImage}
              style={{ objectFit: 'cover' }}
            />
          </div>
        ) : (
          <div className={styles.imagePlaceholder} style={{ background: bg }}>
            <ShoppingCart size={32} opacity={0.4} />
          </div>
        )}

        {/* Badge */}
        {badge && <span className={styles.badge}>{badge}</span>}

        {/* Discount Badge */}
        {discount > 0 && (
          <span className={styles.discountBadge}>-{discount}%</span>
        )}

        {/* Quick Actions Overlay */}
        <div className={styles.overlay}>
          <button className={styles.quickView} aria-label="Quick view">
            <Eye size={16} />
          </button>
          <button className={styles.quickAdd} onClick={handleAdd} aria-label="Add to cart">
            <ShoppingCart size={16} />
            Ajouter
          </button>
        </div>

        {/* Color Dots */}
        {colors.length > 0 && (
          <div className={styles.colorDots}>
            {colors.slice(0, 4).map((c, i) => (
              <span key={i} className={styles.colorDot} style={{ backgroundColor: c }} />
            ))}
            {colors.length > 4 && <span className={styles.colorMore}>+{colors.length - 4}</span>}
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className={styles.info}>
        <h3 className={styles.name}>{name}</h3>

        <div className={styles.priceRow}>
          <span className={styles.price}>${price.toFixed(2)}</span>
          {originalPrice && (
            <span className={styles.originalPrice}>${originalPrice.toFixed(2)}</span>
          )}
        </div>

        {rating > 0 && (
          <div className={styles.rating}>
            <div className={styles.stars}>
              {[1, 2, 3, 4, 5].map(s => (
                <Star
                  key={s}
                  size={12}
                  className={s <= Math.floor(rating) ? styles.starFull : styles.starEmpty}
                  fill={s <= Math.floor(rating) ? 'currentColor' : 'none'}
                />
              ))}
            </div>
            <span className={styles.reviewCount}>({reviewCount})</span>
          </div>
        )}
      </div>
    </Link>
  );
}
