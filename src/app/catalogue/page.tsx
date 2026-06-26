'use client';

import { useState } from 'react';
import styles from './page.module.css';
import { useI18n } from '@/context/I18nContext';
import { useApi } from '@/hooks/useApi';
import ProductCard from '@/components/ProductCard';

interface Category { id: string; name: string; nameFr: string; nameAr: string; icon: string; gradient: string; productCount: number; }
interface Product { id: string; name: string; nameFr: string; nameAr:string; price: number; originalPrice: number | null; badge: string | null; rating: number; reviewCount: number; stock: number; category: Category; variants: { type: string; value: string }[]; images: { url: string; alt: string }[]; }
interface ProductsResponse { products: Product[]; pagination: { page: number; limit: number; total: number; totalPages: number } }

export default function CataloguePage() {
 const { t, locale } = useI18n();
 const [search, setSearch] = useState('');
 const [category, setCategory] = useState('');
 const [sort, setSort] = useState('createdAt');
 const [order, setOrder] = useState('desc');
 const [page, setPage] = useState(1);
 const [minPrice, setMinPrice] = useState('');
 const [maxPrice, setMaxPrice] = useState('');

 const queryParams = new URLSearchParams();
 queryParams.set('page', String(page));
 queryParams.set('limit', '12');
 queryParams.set('sort', sort);
 queryParams.set('order', order);
 if (search) queryParams.set('search', search);
 if (category) queryParams.set('category', category);
 if (minPrice) queryParams.set('minPrice', minPrice);
 if (maxPrice) queryParams.set('maxPrice', maxPrice);

 const { data: categories } = useApi<Category[]>('/api/categories');
 const { data, loading } = useApi<ProductsResponse>(`/api/products?${queryParams.toString()}`);

 const getName = (item: { name: string; nameFr: string; nameAr: string }) =>
 locale === 'fr' ? item.nameFr : locale === 'ar' ? item.nameAr : item.name;

 const products = data?.products || [];
 const pagination = data?.pagination;

 return (
 <main className={styles.main}>
 <div className={styles.pageHeader}>
 <h1 className={styles.pageTitle}>{t('catalogue') || 'Tous les Produits'}</h1>
 <p className={styles.pageSubtitle}>
 {pagination?.total
 ? `${pagination.total} ${t('products_found') || 'produits disponibles'}`
 : locale === 'fr' ? 'Découvrez notre sélection' : 'Discover our selection'}
 </p>
 </div>

 <div className={styles.catalogueLayout}>
 {/* Filters Sidebar */}
 <aside className={styles.filters}>
 <div className={styles.filterCard}>
 <h3>{t('search') || 'Search'}</h3>
 <input
 type="text"
 placeholder={t('search_placeholder') || 'Rechercher un produit...'}
 value={search}
 onChange={e => { setSearch(e.target.value); setPage(1); }}
 className={styles.searchInput}
 />
 </div>

 <div className={styles.filterCard}>
 <h3>{t('categories') || 'Catégories'}</h3>
 <button
 className={`${styles.catBtn} ${!category ? styles.catActive : ''}`}
 onClick={() => { setCategory(''); setPage(1); }}
 >
 {t('all') || 'Tout'}
 <span className={styles.catCount}>{data?.pagination.total || 0}</span>
 </button>
 {categories?.map(cat => (
 <button
 key={cat.id}
 className={`${styles.catBtn} ${category === cat.id ? styles.catActive : ''}`}
 onClick={() => { setCategory(cat.id); setPage(1); }}
 >
 {cat.icon} {getName(cat)}
 <span className={styles.catCount}>{cat.productCount}</span>
 </button>
 ))}
 </div>

 <div className={styles.filterCard}>
 <h3>{t('price_range') || 'Fourchette de Prix'}</h3>
 <div className={styles.priceInputs}>
 <input type="number" placeholder="Min" value={minPrice} onChange={e => { setMinPrice(e.target.value); setPage(1); }} />
 <span>—</span>
 <input type="number" placeholder="Max" value={maxPrice} onChange={e => { setMaxPrice(e.target.value); setPage(1); }} />
 </div>
 </div>

 <div className={styles.filterCard}>
 <h3>{t('sort_by') || 'Trier Par'}</h3>
 <select
 value={`${sort}-${order}`}
 onChange={e => { const [s, o] = e.target.value.split('-'); setSort(s); setOrder(o); setPage(1); }}
 className={styles.sortSelect}
 >
 <option value="createdAt-desc">{t('newest') || 'Plus récent'}</option>
 <option value="price-asc">{t('price_low') || 'Prix croissant'}</option>
 <option value="price-desc">{t('price_high') || 'Prix décroissant'}</option>
 <option value="name-asc">{t('name_az') || 'Nom A-Z'}</option>
 </select>
 </div>
 </aside>

 {/* Products Grid */}
 <div className={styles.productsArea}>
 {loading && (
 <div className={styles.loadingGrid}>
 {[1,2,3,4,5,6].map(i => <div key={i} className={styles.skeleton} />)}
 </div>
 )}

 {!loading && products.length === 0 && (
 <div className={styles.noResults}>
 <span>🔍</span>
 <h2>{t('no_results') || 'Aucun produit trouvé'}</h2>
 <p>{t('try_different') || 'Essayez d\'autres filtres ou termes de recherche'}</p>
 </div>
 )}

 {!loading && products.length > 0 && (
 <>
 <div className={styles.productsHeader}>
 <p className={styles.resultCount}>
 {pagination?.total} {t('products_found') || 'produits trouvés'}
 </p>
 </div>

 <div className={styles.productGrid}>
 {products.map(product => (
 <ProductCard
 key={product.id}
 id={product.id}
 name={getName(product)}
 price={product.price}
 originalPrice={product.originalPrice || undefined}
 badge={product.badge || undefined}
 rating={product.rating}
 reviewCount={product.reviewCount}
 gradient={product.category?.gradient || 'linear-gradient(135deg, #6C5CE7, #a29bfe)'}
 colors={product.variants.filter(v => v.type === 'color').map(v => v.value)}
 image={product.images?.[0]?.url}
 />
 ))}
 </div>

 {/* Pagination */}
 {pagination && pagination.totalPages > 1 && (
 <div className={styles.pagination}>
 <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className={styles.pageBtn}>
 ← {t('prev') || 'Préc.'}
 </button>
 {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(p => (
 <button
 key={p}
 className={`${styles.pageBtn} ${p === page ? styles.pageActive : ''}`}
 onClick={() => setPage(p)}
 >
 {p}
 </button>
 ))}
 <button disabled={page >= pagination.totalPages} onClick={() => setPage(p => p + 1)} className={styles.pageBtn}>
 {t('next') || 'Suiv.'} →
 </button>
 </div>
 )}
 </>
 )}
 </div>
 </div>
 </main>
 );
}
