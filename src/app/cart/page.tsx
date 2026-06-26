'use client';

import Link from 'next/link';
import Image from 'next/image';
import styles from './page.module.css';
import { useI18n } from '@/context/I18nContext';
import { useCart } from '@/context/CartContext';

export default function CartPage() {
 const { t } = useI18n();
 const { items, removeItem, updateQuantity, subtotal, clearCart } = useCart();

 const shipping = subtotal > 100 ? 0 : 9.99;
 const tax = subtotal * 0.2;
 const total = subtotal + shipping + tax;
 const freeShippingProgress = Math.min(100, (subtotal / 100) * 100);

 if (items.length === 0) {
 return (
 <main className={styles.main}>
 <div className={styles.empty}>
 <div className={styles.emptyAnimation}>
 <span className={styles.emptyIcon}></span>
 <div className={styles.emptyRings} />
 </div>
 <h1>{t('cart_empty') || 'Your cart is empty'}</h1>
 <p>{t('cart_empty_desc') || 'Looks like you haven\'t added any items yet.'}</p>
 <Link href="/" className={styles.shopBtn}>
 {t('shop_now') || 'Start Shopping'} →
 </Link>
 </div>
 </main>
 );
 }

 return (
 <main className={styles.main}>
 <div className={styles.pageHeader}>
 <h1 className={styles.pageTitle}>
 {t('shopping_cart') || 'Shopping Cart'}
 <span className={styles.itemCount}>{items.length}</span>
 </h1>
 <button className={styles.clearBtn} onClick={clearCart}>
 {t('clear_cart') || 'Clear All'}
 </button>
 </div>

 {/* Free Shipping Progress */}
 {subtotal < 100 && (
 <div className={styles.shippingBanner}>
 <div className={styles.shippingProgress}>
 <div className={styles.shippingFill} style={{ width: `${freeShippingProgress}%` }} />
 </div>
 <p>💡 {t('free_shipping_hint') || `Add $${(100 - subtotal).toFixed(2)} more for free shipping!`}</p>
 </div>
 )}
 {subtotal >= 100 && (
 <div className={styles.shippingBannerFree}>
 <p>{t('free_shipping_unlocked') || 'Free shipping unlocked!'}</p>
 </div>
 )}

 <div className={styles.cartLayout}>
 {/* Items */}
 <div className={styles.itemsSection}>
 {items.map((item, idx) => {
 const key = `${item.id}-${item.color || ''}-${item.size || ''}`;
 return (
 <div key={key} className={styles.cartItem} style={{ animationDelay: `${idx * 0.05}s` }}>
 <div className={styles.itemImage}>
 {item.image ? (
 <Image src={item.image} alt={item.name} fill sizes="100px" style={{ objectFit: 'cover' }} />
 ) : (
 <span className={styles.imagePlaceholder}></span>
 )}
 </div>
 <div className={styles.itemDetails}>
 <Link href={`/products/${item.id}`} className={styles.itemName}>{item.name}</Link>
 {(item.color || item.size) && (
 <div className={styles.itemVariants}>
 {item.color && <span className={styles.variantTag}>{item.color}</span>}
 {item.size && <span className={styles.variantTag}>📏 {item.size}</span>}
 </div>
 )}
 <p className={styles.itemPrice}>${item.price.toFixed(2)}</p>
 </div>
 <div className={styles.itemActions}>
 <div className={styles.quantity}>
 <button onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))} disabled={item.quantity <= 1}>−</button>
 <span>{item.quantity}</span>
 <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
 </div>
 <span className={styles.itemTotal}>${(item.price * item.quantity).toFixed(2)}</span>
 <button className={styles.removeBtn} onClick={() => removeItem(item.id)} title="Remove">✕</button>
 </div>
 </div>
 );
 })}
 </div>

 {/* Summary */}
 <div className={styles.summaryCard}>
 <h2>{t('order_summary') || 'Order Summary'}</h2>
 <div className={styles.summaryRows}>
 <div className={styles.row}>
 <span>{t('subtotal') || 'Subtotal'} ({items.length} {t('items') || 'items'})</span>
 <span>${subtotal.toFixed(2)}</span>
 </div>
 <div className={styles.row}>
 <span>{t('shipping') || 'Shipping'}</span>
 <span>{shipping === 0 ? <span className={styles.free}>FREE ✓</span> : `$${shipping.toFixed(2)}`}</span>
 </div>
 <div className={styles.row}>
 <span>{t('tax') || 'Tax (20%)'}</span>
 <span>${tax.toFixed(2)}</span>
 </div>
 <div className={styles.divider} />
 <div className={`${styles.row} ${styles.totalRow}`}>
 <span>{t('total') || 'Total'}</span>
 <span>${total.toFixed(2)}</span>
 </div>
 </div>
 <Link href="/checkout" className={styles.checkoutBtn}>
 {t('checkout') || 'Proceed to Checkout'} — ${total.toFixed(2)}
 </Link>
 <Link href="/" className={styles.continueLink}>
 ← {t('continue_shopping') || 'Continue Shopping'}
 </Link>

 {/* Trust badges */}
 <div className={styles.trustBadges}>
 <span>SSL</span>
 <span>Fast</span>
 <span>Returns</span>
 </div>
 </div>
 </div>
 </main>
 );
}
