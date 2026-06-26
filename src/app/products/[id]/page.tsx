'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './page.module.css';
import { useI18n } from '@/context/I18nContext';
import { useCart } from '@/context/CartContext';
import { useApi } from '@/hooks/useApi';
import ProductCard from '@/components/ProductCard';

interface Variant { id: string; type: string; name: string; value: string; stock: number; }
interface Review { id: string; rating: number; comment: string; createdAt: string; user: { name: string } }
interface Product {
  id: string; name: string; nameFr: string; nameAr: string;
  description: string; descriptionFr: string; descriptionAr: string;
  price: number; originalPrice: number | null; badge: string | null;
  countdownEnd: string | null; rating: number; reviewCount: number; stock: number;
  category: { id: string; name: string; nameFr: string; nameAr: string; gradient: string };
  variants: Variant[]; images: { url: string; alt: string }[]; reviews: Review[];
}
interface ProductsResponse { products: Product[] }

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { t, locale } = useI18n();
  const { addItem } = useCart();

  const { data: product, loading, error } = useApi<Product>(`/api/products/${id}`);
  const { data: relatedData } = useApi<ProductsResponse>(product ? `/api/products?category=${product.category.id}&limit=4` : null);

  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'reviews'>('desc');
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });
  const [addedToCart, setAddedToCart] = useState(false);
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);

  const colors = product?.variants.filter(v => v.type === 'color') || [];
  const sizes = product?.variants.filter(v => v.type === 'size') || [];
  const related = relatedData?.products.filter(p => p.id !== id) || [];

  // Auto-select first variants
  useEffect(() => {
    if (colors.length > 0 && !selectedColor) setSelectedColor(colors[0].id);
    if (sizes.length > 0 && !selectedSize) setSelectedSize(sizes[0].id);
  }, [product]);

  // Countdown
  useEffect(() => {
    if (!product?.countdownEnd) return;
    const target = new Date(product.countdownEnd).getTime();
    const timer = setInterval(() => {
      const diff = target - Date.now();
      if (diff <= 0) { clearInterval(timer); return; }
      setCountdown({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        mins: Math.floor((diff % 3600000) / 60000),
        secs: Math.floor((diff % 60000) / 1000),
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [product?.countdownEnd]);

  const getName = (item: { name: string; nameFr: string; nameAr: string }) =>
    locale === 'fr' ? item.nameFr : locale === 'ar' ? item.nameAr : item.name;

  const getDesc = () => {
    if (!product) return '';
    if (locale === 'fr') return product.descriptionFr;
    if (locale === 'ar') return product.descriptionAr;
    return product.description;
  };

  const handleAddToCart = () => {
    if (!product) return;
    const colorVar = colors.find(v => v.id === selectedColor);
    const sizeVar = sizes.find(v => v.id === selectedSize);
    addItem({
      id: product.id,
      name: getName(product),
      price: product.price,
      quantity,
      color: colorVar?.name,
      size: sizeVar?.name,
      image: product.images[0]?.url,
    });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  if (loading) {
    return (
      <main className={styles.main}>
        <div className={styles.loading}>
          <div className={styles.spinner} />
          <p>{t('loading') || 'Loading...'}</p>
        </div>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className={styles.main}>
        <div className={styles.error}>
          <span className={styles.errorIcon}>😞</span>
          <h2>{t('product_not_found') || 'Product not found'}</h2>
          <Link href="/" className={styles.backBtn}>{t('back_home') || '← Back to Home'}</Link>
        </div>
      </main>
    );
  }

  const discountPercent = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;

  const selectedSizeVariant = sizes.find(v => v.id === selectedSize);
  const inStock = selectedSizeVariant ? selectedSizeVariant.stock > 0 : product.stock > 0;

  return (
    <main className={styles.main}>
      {/* Breadcrumb */}
      <nav className={styles.breadcrumb}>
        <Link href="/">{t('home') || 'Home'}</Link>
        <span>/</span>
        <span>{getName(product.category)}</span>
        <span>/</span>
        <span>{getName(product)}</span>
      </nav>

      <div className={styles.productLayout}>
        {/* ─── Gallery ─── */}
        <div className={styles.gallery}>
          <div className={styles.mainImage}>
            {product.badge && <span className={styles.badge}>{product.badge}</span>}
            {product.images.length > 0 ? (
              <Image
                src={product.images[selectedImageIdx]?.url || product.images[0].url}
                alt={product.images[selectedImageIdx]?.alt || product.name}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className={styles.productImage}
                style={{ objectFit: 'cover' }}
                priority
              />
            ) : (
              <div className={styles.imageFallback} style={{ background: product.category.gradient }}>
                <span className={styles.productEmoji}>🛍️</span>
              </div>
            )}
          </div>
          <div className={styles.thumbnails}>
            {product.images.map((img, i) => (
              <button
                key={img.url}
                className={`${styles.thumb} ${selectedImageIdx === i ? styles.thumbActive : ''}`}
                onClick={() => setSelectedImageIdx(i)}
              >
                <Image src={img.url} alt={img.alt || ''} fill sizes="80px" style={{ objectFit: 'cover' }} />
              </button>
            ))}
          </div>
        </div>

        {/* ─── Product Info ─── */}
        <div className={styles.productInfo}>
          <span className={styles.categoryTag}>{getName(product.category)}</span>
          <h1 className={styles.productTitle}>{getName(product)}</h1>

          {/* Rating */}
          <div className={styles.rating}>
            <div className={styles.stars}>
              {[1, 2, 3, 4, 5].map(s => (
                <span key={s} className={s <= Math.round(product.rating) ? styles.starFilled : styles.starEmpty}>★</span>
              ))}
            </div>
            <span className={styles.ratingText}>{product.rating} ({product.reviewCount} {t('reviews') || 'reviews'})</span>
          </div>

          {/* Price */}
          <div className={styles.priceBlock}>
            <span className={styles.price}>${product.price.toFixed(2)}</span>
            {product.originalPrice && (
              <>
                <span className={styles.oldPrice}>${product.originalPrice.toFixed(2)}</span>
                <span className={styles.discount}>-{discountPercent}%</span>
              </>
            )}
          </div>

          {/* Flash Sale Countdown */}
          {product.countdownEnd && (
            <div className={styles.flashSale}>
              <span className={styles.flashLabel}>⚡ {t('flash_sale') || 'Flash Sale'}</span>
              <div className={styles.flashTimer}>
                {[
                  { v: countdown.days, l: 'D' },
                  { v: countdown.hours, l: 'H' },
                  { v: countdown.mins, l: 'M' },
                  { v: countdown.secs, l: 'S' },
                ].map(i => (
                  <span key={i.l} className={styles.flashUnit}>{String(i.v).padStart(2, '0')}{i.l}</span>
                ))}
              </div>
            </div>
          )}

          {/* Color Variants */}
          {colors.length > 0 && (
            <div className={styles.variantGroup}>
              <label>{t('color') || 'Color'}: <strong>{colors.find(c => c.id === selectedColor)?.name}</strong></label>
              <div className={styles.colorOptions}>
                {colors.map(c => (
                  <button
                    key={c.id}
                    className={`${styles.colorSwatch} ${selectedColor === c.id ? styles.colorActive : ''}`}
                    style={{ backgroundColor: c.value }}
                    onClick={() => setSelectedColor(c.id)}
                    title={c.name}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Size Variants */}
          {sizes.length > 0 && (
            <div className={styles.variantGroup}>
              <label>{t('size') || 'Size'}</label>
              <div className={styles.sizeOptions}>
                {sizes.map(s => (
                  <button
                    key={s.id}
                    className={`${styles.sizeBtn} ${selectedSize === s.id ? styles.sizeActive : ''} ${s.stock === 0 ? styles.sizeDisabled : ''}`}
                    onClick={() => s.stock > 0 && setSelectedSize(s.id)}
                    disabled={s.stock === 0}
                  >
                    {s.name}
                    {s.stock <= 3 && s.stock > 0 && <span className={styles.lowStock}>{s.stock} left</span>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity + Add to Cart */}
          <div className={styles.actions}>
            <div className={styles.quantity}>
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button>
              <span>{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)}>+</button>
            </div>
            <button
              className={`${styles.addToCart} ${addedToCart ? styles.added : ''}`}
              onClick={handleAddToCart}
              disabled={!inStock}
            >
              {!inStock ? (t('out_of_stock') || 'Out of Stock')
                : addedToCart ? `✓ ${t('added') || 'Added!'}`
                : `🛒 ${t('add_to_cart') || 'Add to Cart'} — $${(product.price * quantity).toFixed(2)}`}
            </button>
          </div>

          {/* Stock indicator */}
          <div className={styles.stockInfo}>
            {inStock ? (
              <span className={styles.inStock}>✓ {t('in_stock') || 'In Stock'} ({selectedSizeVariant?.stock || product.stock} {t('available') || 'available'})</span>
            ) : (
              <span className={styles.outOfStock}>✕ {t('out_of_stock') || 'Out of Stock'}</span>
            )}
          </div>
        </div>
      </div>

      {/* ─── Tabs ─── */}
      <section className={styles.tabs}>
        <div className={styles.tabHeaders}>
          {(['desc', 'specs', 'reviews'] as const).map(tab => (
            <button
              key={tab}
              className={`${styles.tabBtn} ${activeTab === tab ? styles.tabActive : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'desc' ? (t('description') || 'Description')
                : tab === 'specs' ? (t('specifications') || 'Specifications')
                : `${t('reviews') || 'Reviews'} (${product.reviewCount})`}
            </button>
          ))}
        </div>

        <div className={styles.tabContent}>
          {activeTab === 'desc' && (
            <div className={styles.descContent}>
              <p>{getDesc()}</p>
            </div>
          )}

          {activeTab === 'specs' && (
            <div className={styles.specsGrid}>
              <div className={styles.specRow}><span>{t('category') || 'Category'}</span><span>{getName(product.category)}</span></div>
              <div className={styles.specRow}><span>{t('total_stock') || 'Total Stock'}</span><span>{product.stock} units</span></div>
              <div className={styles.specRow}><span>{t('colors_available') || 'Colors'}</span><span>{colors.length}</span></div>
              <div className={styles.specRow}><span>{t('sizes_available') || 'Sizes'}</span><span>{sizes.map(s => s.name).join(', ')}</span></div>
              <div className={styles.specRow}><span>{t('currency') || 'Currency'}</span><span>USD</span></div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className={styles.reviewsList}>
              {product.reviews.length === 0 && (
                <p className={styles.noReviews}>{t('no_reviews') || 'No reviews yet. Be the first!'}</p>
              )}
              {product.reviews.map(r => (
                <div key={r.id} className={styles.reviewCard}>
                  <div className={styles.reviewHeader}>
                    <div className={styles.reviewAvatar}>{r.user.name[0]}</div>
                    <div>
                      <strong>{r.user.name}</strong>
                      <div className={styles.reviewStars}>
                        {[1, 2, 3, 4, 5].map(s => (
                          <span key={s} className={s <= r.rating ? styles.starFilled : styles.starEmpty}>★</span>
                        ))}
                      </div>
                    </div>
                    <span className={styles.reviewDate}>{new Date(r.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className={styles.reviewComment}>{r.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ─── Related Products ─── */}
      {related.length > 0 && (
        <section className={styles.related}>
          <h2 className={styles.sectionTitle}>{t('related_products') || 'You May Also Like'}</h2>
          <div className={styles.relatedGrid}>
            {related.map(p => (
              <ProductCard
                key={p.id}
                id={p.id}
                name={getName(p)}
                price={p.price}
                originalPrice={p.originalPrice || undefined}
                badge={p.badge || undefined}
                rating={p.rating}
                reviewCount={p.reviewCount}
                gradient={p.category?.gradient || 'linear-gradient(135deg, #6C5CE7, #a29bfe)'}
                colors={p.variants.filter(v => v.type === 'color').map(v => v.value)}
                image={p.images?.[0]?.url}
              />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
