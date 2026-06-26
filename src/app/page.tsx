'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './page.module.css';
import ProductCard from '@/components/ProductCard';
import { useI18n } from '@/context/I18nContext';
import { useApi } from '@/hooks/useApi';
import { CategoryIconTile } from '@/components/CategoryIconPicker';
import { Truck, ShieldCheck, RefreshCw, Headphones, Flame, Sparkles, Rocket } from 'lucide-react';

interface Category { id: string; name: string; nameFr: string; nameAr: string; icon: string; gradient: string; productCount: number; }
interface Product { id: string; name: string; nameFr: string; nameAr: string; price: number; originalPrice: number | null; badge: string | null; rating: number; reviewCount: number; stock: number; category: Category; variants: { type: string; value: string }[]; images: { url: string; alt: string }[]; }
interface ProductsResponse { products: Product[]; pagination: { total: number } }

export default function HomePage() {
 const { t, locale } = useI18n();
 const { data: categories } = useApi<Category[]>('/api/categories');
 const { data: featuredData } = useApi<ProductsResponse>('/api/products?featured=true&limit=8');
 const { data: newData } = useApi<ProductsResponse>('/api/products?limit=4&sort=createdAt&order=desc');

 const [heroIndex, setHeroIndex] = useState(0);
 const [countdown, setCountdown] = useState({ h: 23, m: 59, s: 59 });

 // Hero slides — use t() keys
 const heroSlides = [
 {
 titleKey: 'home.summer_sale', subKey: 'home.summer_sub', ctaKey: 'home.summer_cta',
 gradient: 'linear-gradient(135deg, #6C5CE7 0%, #a29bfe 50%, #fd79a8 100%)',
 icon: <Flame size={36} strokeWidth={1.5} />, image: '',
 },
 {
 titleKey: 'home.new_coll', subKey: 'home.new_coll_sub', ctaKey: 'home.new_coll_cta',
 gradient: 'linear-gradient(135deg, #0984e3 0%, #6C5CE7 50%, #e84393 100%)',
 icon: <Sparkles size={36} strokeWidth={1.5} />, image: '',
 },
 {
 titleKey: 'home.express', subKey: 'home.express_sub', ctaKey: 'home.express_cta',
 gradient: 'linear-gradient(135deg, #00b894 0%, #6C5CE7 50%, #fdcb6e 100%)',
 icon: <Rocket size={36} strokeWidth={1.5} />, image: '',
 },
 ];

 const nextSlide = useCallback(() => setHeroIndex(i => (i + 1) % heroSlides.length), [heroSlides.length]);
 const prevSlide = useCallback(() => setHeroIndex(i => (i - 1 + heroSlides.length) % heroSlides.length), [heroSlides.length]);

 useEffect(() => {
 const auto = setInterval(nextSlide, 5000);
 return () => clearInterval(auto);
 }, [nextSlide]);

 useEffect(() => {
 const timer = setInterval(() => {
 setCountdown(prev => {
 if (prev.s > 0) return { ...prev, s: prev.s - 1 };
 if (prev.m > 0) return { ...prev, m: prev.m - 1, s: 59 };
 if (prev.h > 0) return { h: prev.h - 1, m: 59, s: 59 };
 return { h: 23, m: 59, s: 59 };
 });
 }, 1000);
 return () => clearInterval(timer);
 }, []);

 const getName = (item: { name: string; nameFr: string; nameAr: string }) => {
 if (locale === 'fr') return item.nameFr;
 if (locale === 'ar') return item.nameAr;
 return item.name; // en, es, pt fallback to English names
 };

 const slide = heroSlides[heroIndex];
 const featured = featuredData?.products || [];
 const newProducts = newData?.products || [];

 const trustItems = [
 { icon: <Truck size={26} strokeWidth={1.5} />, title: t('trust.fast_delivery'), desc: t('trust.fast_desc') },
 { icon: <ShieldCheck size={26} strokeWidth={1.5} />, title: t('trust.secure'), desc: t('trust.secure_desc') },
 { icon: <RefreshCw size={26} strokeWidth={1.5} />, title: t('trust.returns'), desc: t('trust.returns_desc') },
 { icon: <Headphones size={26} strokeWidth={1.5} />, title: t('trust.support'), desc: t('trust.support_desc') },
 ];

 return (
 <main className={styles.main}>
 {/* Announcement Bar */}
 <div className={styles.announcementBar}>
 {t('home.announcement')}
 </div>

 {/* Hero Slider */}
 <section className={styles.heroSection}>
 <div
 className={styles.heroSlider}
 style={slide.image ? undefined : { backgroundImage: slide.gradient }}
 >
 {slide.image && (
 <Image
 key={heroIndex}
 src={slide.image}
 alt={t(slide.titleKey)}
 fill priority unoptimized
 style={{ objectFit: 'cover', objectPosition: 'center' }}
 />
 )}
 <div
 className={styles.heroOverlay}
 style={slide.image ? { background: 'linear-gradient(to right, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.3) 60%, rgba(0,0,0,0.1) 100%)' } : undefined}
 />
 <div className={styles.heroContent}>
 <span className={styles.heroIcon}>{slide.icon}</span>
 <h1 className={styles.heroTitle} key={`title-${heroIndex}`}>
 {t(slide.titleKey)}
 </h1>
 <p className={styles.heroSubtitle}>{t(slide.subKey)}</p>
 <div className={styles.heroCtas}>
 <Link href="/catalogue" className={styles.heroBtnPrimary}>
 {t(slide.ctaKey)} →
 </Link>
 <Link href="/catalogue" className={styles.heroBtnSecondary}>
 {t('hero.cta2')}
 </Link>
 </div>
 </div>
 <button className={styles.heroArrow} onClick={prevSlide} style={{ left: 20 }}>‹</button>
 <button className={styles.heroArrow} onClick={nextSlide} style={{ right: 20 }}>›</button>
 <div className={styles.heroDots}>
 {heroSlides.map((_, i) => (
 <button key={i} className={`${styles.heroDot} ${i === heroIndex ? styles.heroDotActive : ''}`} onClick={() => setHeroIndex(i)} />
 ))}
 </div>
 </div>
 </section>

 {/* Flash Sale Countdown */}
 <section className={styles.flashSale}>
 <div className={styles.flashInner}>
 <div className={styles.flashLeft}>
 <span className={styles.flashIcon}></span>
 <div>
 <h2 className={styles.flashTitle}>{t('product.flashSale')}</h2>
 <p className={styles.flashDesc}>{t('home.flash_desc')}</p>
 </div>
 </div>
 <div className={styles.countdownRow}>
 {[
 { val: countdown.h, label: t('home.hours') },
 { val: countdown.m, label: 'Min' },
 { val: countdown.s, label: 'Sec' },
 ].map(({ val, label }, idx) => (
 <React.Fragment key={label}>
 {idx > 0 && <span className={styles.countdownSep}>:</span>}
 <div className={styles.countdownBlock}>
 <span className={styles.countdownVal} key={val}>{String(val).padStart(2, '0')}</span>
 <span className={styles.countdownLabel}>{label}</span>
 </div>
 </React.Fragment>
 ))}
 </div>
 </div>
 </section>

 {/* Categories */}
 <section className={styles.section} id="categories">
 <div className={styles.container}>
 <div className={styles.sectionHeader}>
 <h2 className={styles.sectionTitle}>{t('section.categories')}</h2>
 <Link href="/catalogue" className={styles.viewAll}>{t('general.viewAll')} →</Link>
 </div>
 <div className={styles.categoryGrid}>
 {categories?.map(cat => (
 <Link key={cat.id} href={`/catalogue?category=${cat.id}`} className={styles.categoryCard}>
 <div className={styles.categoryIconWrap}>
 <CategoryIconTile iconId={cat.icon} gradient={cat.gradient} size="lg" animate={true} />
 </div>
 <h3 className={styles.categoryName}>{getName(cat)}</h3>
 <span className={styles.categoryCount}>{cat.productCount} {t('general.items')}</span>
 </Link>
 ))}
 </div>
 </div>
 </section>

 {/* Featured Products */}
 <section className={styles.section} id="featured">
 <div className={styles.container}>
 <div className={styles.sectionHeader}>
 <div>
 <h2 className={styles.sectionTitle}>{t('section.featured')}</h2>
 <p className={styles.sectionSub}>{t('section.featured.sub')}</p>
 </div>
 <Link href="/catalogue" className={styles.viewAll}>{t('general.viewAll')} →</Link>
 </div>
 <div className={styles.productGrid}>
 {featured.map(product => (
 <ProductCard
 key={product.id} id={product.id}
 name={getName(product)} price={product.price}
 originalPrice={product.originalPrice || undefined} badge={product.badge || undefined}
 rating={product.rating} reviewCount={product.reviewCount}
 gradient={product.category?.gradient}
 colors={product.variants?.filter(v => v.type === 'color').map(v => v.value)}
 image={product.images?.[0]?.url}
 />
 ))}
 </div>
 </div>
 </section>

 {/* Promo Banner */}
 <section className={styles.promoBanner}>
 <div className={styles.promoInner}>
 <div className={styles.promoText}>
 <span className={styles.promoBadge}>PROMO</span>
 <h2>{t('home.new_customer')}</h2>
 <p>{t('home.promo_desc')}</p>
 <div className={styles.promoCode}>WELCOME10</div>
 </div>
 </div>
 </section>

 {/* New Arrivals */}
 {newProducts.length > 0 && (
 <section className={styles.section}>
 <div className={styles.container}>
 <div className={styles.sectionHeader}>
 <div>
 <h2 className={styles.sectionTitle}>{t('home.new_arrivals')}</h2>
 <p className={styles.sectionSub}>{t('home.new_arrivals_sub')}</p>
 </div>
 <Link href="/catalogue?sort=createdAt&order=desc" className={styles.viewAll}>{t('general.viewAll')} →</Link>
 </div>
 <div className={styles.productGrid}>
 {newProducts.map(product => (
 <ProductCard
 key={product.id} id={product.id}
 name={getName(product)} price={product.price}
 originalPrice={product.originalPrice || undefined} badge={product.badge || undefined}
 rating={product.rating} reviewCount={product.reviewCount}
 gradient={product.category?.gradient}
 colors={product.variants?.filter(v => v.type === 'color').map(v => v.value)}
 image={product.images?.[0]?.url}
 />
 ))}
 </div>
 </div>
 </section>
 )}

 {/* Trust Badges */}
 <section className={styles.trustSection}>
 <div className={styles.container}>
 <div className={styles.trustGrid}>
 {trustItems.map((item, i) => (
 <div key={i} className={styles.trustCard}>
 <span className={styles.trustIcon}>{item.icon}</span>
 <h4>{item.title}</h4>
 <p>{item.desc}</p>
 </div>
 ))}
 </div>
 </div>
 </section>
 </main>
 );
}
