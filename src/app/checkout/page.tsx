'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import { useI18n } from '@/context/I18nContext';
import { useCart } from '@/context/CartContext';
import { apiCall } from '@/hooks/useApi';

export default function CheckoutPage() {
 const { t } = useI18n();
 const { items, subtotal, clearCart } = useCart();
 const router = useRouter();

 const [form, setForm] = useState({ name: '', email: '', phone: '', street: '', city: '', zip: '', country: '' });
 const [paymentMethod, setPaymentMethod] = useState<'card' | 'cod'>('card');
 const [cardData, setCardData] = useState({ number: '', expiry: '', cvc: '' });
 const [promoCode, setPromoCode] = useState('');
 const [promoResult, setPromoResult] = useState<{ valid: boolean; discount?: number; error?: string } | null>(null);
 const [submitting, setSubmitting] = useState(false);
 const [orderResult, setOrderResult] = useState<{ orderNumber: string; total: number } | null>(null);

 const discount = promoResult?.valid ? promoResult.discount || 0 : 0;
 const shipping = subtotal - discount > 100 ? 0 : 9.99;
 const tax = (subtotal - discount) * 0.2;
 const total = subtotal - discount + shipping + tax;

 const handleInput = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

 const validatePromo = async () => {
 if (!promoCode.trim()) return;
 try {
 const result = await apiCall<{ valid: boolean; discount?: number; error?: string }>('/api/promo/validate', 'POST', { code: promoCode, subtotal });
 setPromoResult(result);
 } catch {
 setPromoResult({ valid: false, error: 'Validation failed' });
 }
 };

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 if (items.length === 0) return;
 setSubmitting(true);

 try {
 const orderData = {
 paymentMethod,
 promoCode: promoResult?.valid ? promoCode : undefined,
 shippingAddress: { name: form.name, phone: form.phone, street: form.street, city: form.city, zip: form.zip, country: form.country },
 items: items.map(item => ({
 productId: item.id,
 quantity: item.quantity,
 variantName: [item.color, item.size].filter(Boolean).join(' / ') || undefined,
 })),
 };

 const order = await apiCall<{ orderNumber: string; total: number }>('/api/orders', 'POST', orderData);
 setOrderResult(order);
 clearCart();
 } catch (err) {
 alert(err instanceof Error ? err.message : 'Order failed');
 } finally {
 setSubmitting(false);
 }
 };

 // Success screen
 if (orderResult) {
 return (
 <main className={styles.main}>
 <div className={styles.success}>
 <div className={styles.successIcon}>✓</div>
 <h1>{t('order_confirmed') || 'Order Confirmed!'}</h1>
 <p className={styles.orderNumber}>{orderResult.orderNumber}</p>
 <p>{t('order_email') || 'Confirmation email sent to'} {form.email}</p>
 <div className={styles.successTotal}>${orderResult.total?.toFixed(2)}</div>
 {paymentMethod === 'cod' && (
 <div className={styles.codNotice}>
 📄 {t('proforma_notice') || 'A proforma invoice has been generated. Pay upon delivery.'}
 </div>
 )}
 <div className={styles.successActions}>
 <button onClick={() => router.push(`/tracking?order=${orderResult.orderNumber}`)} className={styles.btnPrimary}>
 {t('track_order') || 'Track Order'}
 </button>
 <button onClick={() => router.push('/')} className={styles.btnSecondary}>
 {t('continue_shopping') || 'Continue Shopping'}
 </button>
 </div>
 </div>
 </main>
 );
 }

 // Empty cart
 if (items.length === 0) {
 return (
 <main className={styles.main}>
 <div className={styles.emptyCart}>
 <span className={styles.emptyIcon}></span>
 <h2>{t('cart_empty') || 'Your cart is empty'}</h2>
 <button onClick={() => router.push('/')} className={styles.btnPrimary}>
 {t('shop_now') || 'Shop Now'}
 </button>
 </div>
 </main>
 );
 }

 return (
 <main className={styles.main}>
 <h1 className={styles.pageTitle}>{t('checkout') || 'Checkout'}</h1>

 <form className={styles.checkoutGrid} onSubmit={handleSubmit}>
 {/* Left — Form */}
 <div className={styles.formSection}>
 {/* Shipping */}
 <div className={styles.card}>
 <h2 className={styles.cardTitle}>{t('shipping_address') || 'Shipping Address'}</h2>
 <div className={styles.formGrid}>
 <div className={styles.field}>
 <label>{t('full_name') || 'Full Name'}</label>
 <input type="text" required value={form.name} onChange={e => handleInput('name', e.target.value)} placeholder="John Doe" />
 </div>
 <div className={styles.field}>
 <label>{t('email') || 'Email'}</label>
 <input type="email" required value={form.email} onChange={e => handleInput('email', e.target.value)} placeholder="john@example.com" />
 </div>
 <div className={styles.field}>
 <label>{t('phone') || 'Phone'}</label>
 <input type="tel" required value={form.phone} onChange={e => handleInput('phone', e.target.value)} placeholder="+1 555 000 0000" />
 </div>
 <div className={styles.fieldFull}>
 <label>{t('address') || 'Street Address'}</label>
 <input type="text" required value={form.street} onChange={e => handleInput('street', e.target.value)} placeholder="123 Main St" />
 </div>
 <div className={styles.field}>
 <label>{t('city') || 'City'}</label>
 <input type="text" required value={form.city} onChange={e => handleInput('city', e.target.value)} placeholder="New York" />
 </div>
 <div className={styles.field}>
 <label>{t('zip') || 'Postal Code'}</label>
 <input type="text" required value={form.zip} onChange={e => handleInput('zip', e.target.value)} placeholder="10001" />
 </div>
 <div className={styles.field}>
 <label>{t('country') || 'Country'}</label>
 <select required value={form.country} onChange={e => handleInput('country', e.target.value)}>
 <option value="">{t('select_country') || 'Select...'}</option>
 <option value="US">United States</option>
 <option value="FR">France</option>
 <option value="MA">Morocco</option>
 <option value="DZ">Algeria</option>
 <option value="TN">Tunisia</option>
 <option value="GB">United Kingdom</option>
 <option value="DE">Germany</option>
 <option value="AE">UAE</option>
 </select>
 </div>
 </div>
 </div>

 {/* Payment */}
 <div className={styles.card}>
 <h2 className={styles.cardTitle}>{t('payment_method') || 'Payment Method'}</h2>
 <div className={styles.paymentOptions}>
 <button type="button" className={`${styles.paymentOption} ${paymentMethod === 'card' ? styles.paymentActive : ''}`} onClick={() => setPaymentMethod('card')}>
 <span className={styles.paymentIcon}></span>
 <div>
 <strong>{t('credit_card') || 'Credit Card'}</strong>
 <small>Visa, Mastercard, Amex</small>
 </div>
 <span className={styles.paymentCheck}>{paymentMethod === 'card' ? '●' : '○'}</span>
 </button>
 <button type="button" className={`${styles.paymentOption} ${paymentMethod === 'cod' ? styles.paymentActive : ''}`} onClick={() => setPaymentMethod('cod')}>
 <span className={styles.paymentIcon}></span>
 <div>
 <strong>{t('cash_delivery') || 'Cash on Delivery'}</strong>
 <small>{t('proforma_generated') || 'Proforma invoice generated'}</small>
 </div>
 <span className={styles.paymentCheck}>{paymentMethod === 'cod' ? '●' : '○'}</span>
 </button>
 </div>

 {paymentMethod === 'card' && (
 <div className={styles.cardForm}>
 <div className={styles.fieldFull}>
 <label>{t('card_number') || 'Card Number'}</label>
 <input type="text" placeholder="4242 4242 4242 4242" value={cardData.number} onChange={e => setCardData(p => ({ ...p, number: e.target.value }))} />
 </div>
 <div className={styles.field}>
 <label>{t('expiry') || 'Expiry'}</label>
 <input type="text" placeholder="MM/YY" value={cardData.expiry} onChange={e => setCardData(p => ({ ...p, expiry: e.target.value }))} />
 </div>
 <div className={styles.field}>
 <label>CVC</label>
 <input type="text" placeholder="123" value={cardData.cvc} onChange={e => setCardData(p => ({ ...p, cvc: e.target.value }))} />
 </div>
 </div>
 )}
 </div>
 </div>

 {/* Right — Summary */}
 <div className={styles.summarySection}>
 <div className={styles.card}>
 <h2 className={styles.cardTitle}>📋 {t('order_summary') || 'Order Summary'}</h2>

 <div className={styles.itemsList}>
 {items.map(item => (
 <div key={`${item.id}-${item.color}-${item.size}`} className={styles.summaryItem}>
 <div className={styles.itemInfo}>
 <strong>{item.name}</strong>
 {(item.color || item.size) && (
 <small>{[item.color, item.size].filter(Boolean).join(' / ')}</small>
 )}
 <small>x{item.quantity}</small>
 </div>
 <span>${(item.price * item.quantity).toFixed(2)}</span>
 </div>
 ))}
 </div>

 {/* Promo Code */}
 <div className={styles.promoSection}>
 <div className={styles.promoInput}>
 <input
 type="text"
 placeholder={t('promo_placeholder') || 'Promo code'}
 value={promoCode}
 onChange={e => { setPromoCode(e.target.value.toUpperCase()); setPromoResult(null); }}
 />
 <button type="button" onClick={validatePromo}>{t('apply') || 'Apply'}</button>
 </div>
 {promoResult && (
 <p className={promoResult.valid ? styles.promoSuccess : styles.promoError}>
 {promoResult.valid ? `✓ -$${promoResult.discount?.toFixed(2)}` : promoResult.error}
 </p>
 )}
 </div>

 {/* Totals */}
 <div className={styles.totals}>
 <div className={styles.totalRow}><span>{t('subtotal') || 'Subtotal'}</span><span>${subtotal.toFixed(2)}</span></div>
 {discount > 0 && <div className={`${styles.totalRow} ${styles.discountRow}`}><span>{t('discount') || 'Discount'}</span><span>-${discount.toFixed(2)}</span></div>}
 <div className={styles.totalRow}><span>{t('shipping') || 'Shipping'}</span><span>{shipping === 0 ? (t('free') || 'FREE') : `$${shipping.toFixed(2)}`}</span></div>
 <div className={styles.totalRow}><span>{t('tax') || 'Tax (20%)'}</span><span>${tax.toFixed(2)}</span></div>
 <div className={`${styles.totalRow} ${styles.totalFinal}`}><span>{t('total') || 'Total'}</span><span>${total.toFixed(2)}</span></div>
 </div>

 <button type="submit" className={styles.placeOrder} disabled={submitting}>
 {submitting ? 'Processing...' : `${t('place_order') || 'Place Order'} — $${total.toFixed(2)}`}
 </button>

 <p className={styles.secure}>{t('secure_checkout') || 'Secure 256-bit SSL Encrypted'}</p>
 </div>
 </div>
 </form>
 </main>
 );
}
