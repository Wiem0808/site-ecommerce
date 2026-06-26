'use client';

import React from 'react';
import { useCart } from '@/context/CartContext';
import { useI18n } from '@/context/I18nContext';
import Link from 'next/link';
import styles from './CartDrawer.module.css';

export default function CartDrawer() {
 const { items, removeItem, updateQuantity, totalItems, subtotal, tax, shipping, total, isCartOpen, setIsCartOpen } = useCart();
 const { t } = useI18n();

 if (!isCartOpen) return null;

 return (
 <>
 <div className={styles.overlay} onClick={() => setIsCartOpen(false)} />
 <div className={styles.drawer}>
 <div className={styles.header}>
 <h2 className={styles.title}>
 {t('cart.title')} ({totalItems})
 </h2>
 <button className={styles.close} onClick={() => setIsCartOpen(false)}>✕</button>
 </div>

 {items.length === 0 ? (
 <div className={styles.empty}>
 <span className={styles.emptyIcon}></span>
 <p>{t('cart.empty')}</p>
 <button className="btn btn-primary" onClick={() => setIsCartOpen(false)}>
 {t('cart.continueShopping')}
 </button>
 </div>
 ) : (
 <>
 <div className={styles.items}>
 {items.map((item) => (
 <div key={`${item.id}-${item.color || ''}-${item.size || ''}`} className={styles.item}>
 <div className={styles.itemImage}></div>
 <div className={styles.itemInfo}>
 <h4 className={styles.itemName}>{item.name}</h4>
 <p className={styles.itemVariant}>
 {item.color && `${item.color}`}
 {item.size && ` · ${item.size}`}
 </p>
 <div className={styles.itemActions}>
 <div className={styles.qtyControl}>
 <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>−</button>
 <span>{item.quantity}</span>
 <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
 </div>
 <span className={styles.itemPrice}>${(item.price * item.quantity).toFixed(2)}</span>
 </div>
 </div>
 <button className={styles.removeBtn} onClick={() => removeItem(item.id)}></button>
 </div>
 ))}
 </div>

 <div className={styles.summary}>
 <div className={styles.summaryRow}>
 <span>{t('cart.subtotal')}</span>
 <span>${subtotal.toFixed(2)}</span>
 </div>
 <div className={styles.summaryRow}>
 <span>{t('cart.shipping')}</span>
 <span>{shipping === 0 ? t('cart.free') : `$${shipping.toFixed(2)}`}</span>
 </div>
 <div className={styles.summaryRow}>
 <span>{t('cart.tax')} (20%)</span>
 <span>${tax.toFixed(2)}</span>
 </div>
 <div className={`${styles.summaryRow} ${styles.totalRow}`}>
 <span>{t('cart.total')}</span>
 <span>${total.toFixed(2)}</span>
 </div>
 <Link href="/checkout" className="btn btn-primary" style={{ width: '100%', textAlign: 'center' }} onClick={() => setIsCartOpen(false)}>
 {t('cart.checkout')}
 </Link>
 </div>
 </>
 )}
 </div>
 </>
 );
}
