'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import styles from './page.module.css';
import { useI18n } from '@/context/I18nContext';

interface TrackingEvent { id: string; status: string; label: string; labelFr: string; labelAr: string; location: string | null; timestamp: string; }
interface OrderItem { id: string; quantity: number; unitPrice: number; totalPrice: number; productName: string; variantName: string | null; }
interface TrackedOrder {
 id: string; orderNumber: string; status: string; paymentMethod: string; paymentStatus: string;
 subtotal: number; shippingCost: number; tax: number; total: number;
 createdAt: string; user: { name: string; email: string; phone: string };
 address: { street: string; city: string; zip: string; country: string } | null;
 items: OrderItem[]; tracking: TrackingEvent[]; invoices: { invoiceNumber: string; type: string }[];
}

const statusSteps = ['confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered'];

export default function TrackingPage() {
 return (
 <Suspense fallback={<div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><p>Loading...</p></div>}>
 <TrackingContent />
 </Suspense>
 );
}

function TrackingContent() {
 const { t, locale } = useI18n();
 const searchParams = useSearchParams();
 const initialOrder = searchParams.get('order') || '';

 const [searchValue, setSearchValue] = useState(initialOrder);
 const [order, setOrder] = useState<TrackedOrder | null>(null);
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState<string | null>(null);
 const [mapProgress, setMapProgress] = useState(0);

 const fetchOrder = async (query: string) => {
 if (!query.trim()) return;
 setLoading(true);
 setError(null);
 try {
 const res = await fetch(`/api/orders/${query.trim()}`);
 if (!res.ok) throw new Error('Order not found');
 const data = await res.json();
 setOrder(data);
 } catch {
 setError(t('order_not_found') || 'Order not found. Please check your order number.');
 setOrder(null);
 } finally {
 setLoading(false);
 }
 };

 useEffect(() => { if (initialOrder) fetchOrder(initialOrder); }, [initialOrder]);

 // Animate map progress based on status
 useEffect(() => {
 if (!order) return;
 const statusIndex = statusSteps.indexOf(order.status);
 const target = statusIndex >= 0 ? ((statusIndex + 1) / statusSteps.length) * 100 : 0;
 let current = 0;
 const timer = setInterval(() => {
 current += 2;
 if (current >= target) { clearInterval(timer); current = target; }
 setMapProgress(current);
 }, 30);
 return () => clearInterval(timer);
 }, [order?.status]);

 const getLabel = (event: TrackingEvent) =>
 locale === 'fr' ? event.labelFr : locale === 'ar' ? event.labelAr : event.label;

 const currentStepIndex = order ? statusSteps.indexOf(order.status) : -1;

 return (
 <main className={styles.main}>
 <h1 className={styles.pageTitle}>{t('track_order') || 'Track Your Order'}</h1>

 {/* Search */}
 <div className={styles.searchSection}>
 <div className={styles.searchBox}>
 <input
 type="text"
 placeholder={t('enter_order') || 'Enter order number (e.g. WW-20260401-001)'}
 value={searchValue}
 onChange={e => setSearchValue(e.target.value)}
 onKeyDown={e => e.key === 'Enter' && fetchOrder(searchValue)}
 className={styles.searchInput}
 />
 <button onClick={() => fetchOrder(searchValue)} className={styles.searchBtn} disabled={loading}>
 {loading ? '' : '🔍'}
 </button>
 </div>
 {error && <p className={styles.error}>{error}</p>}
 </div>

 {loading && (
 <div className={styles.loading}>
 <div className={styles.spinner} />
 <p>{t('searching') || 'Searching...'}</p>
 </div>
 )}

 {order && (
 <div className={styles.trackingLayout}>
 {/* Timeline */}
 <div className={styles.timelineSection}>
 <div className={styles.card}>
 <div className={styles.orderHeader}>
 <div>
 <h2 className={styles.orderNumber}>{order.orderNumber}</h2>
 <p className={styles.orderDate}>
 {t('placed_on') || 'Placed on'} {new Date(order.createdAt).toLocaleDateString(locale === 'fr' ? 'fr-FR' : locale === 'ar' ? 'ar-SA' : 'en-US', { dateStyle: 'long' })}
 </p>
 </div>
 <span className={`${styles.statusBadge} ${styles[`status_${order.status}`] || ''}`}>
 {order.status.replace(/_/g, ' ').toUpperCase()}
 </span>
 </div>

 {/* Status Steps */}
 <div className={styles.statusSteps}>
 {statusSteps.map((step, i) => (
 <div key={step} className={`${styles.step} ${i <= currentStepIndex ? styles.stepActive : ''} ${i === currentStepIndex ? styles.stepCurrent : ''}`}>
 <div className={styles.stepDot}>
 {i < currentStepIndex ? '✓' : i === currentStepIndex ? '●' : '○'}
 </div>
 {i < statusSteps.length - 1 && (
 <div className={`${styles.stepLine} ${i < currentStepIndex ? styles.stepLineActive : ''}`} />
 )}
 <span className={styles.stepLabel}>
 {step === 'confirmed' ? (t('confirmed') || 'Confirmed')
 : step === 'processing' ? (t('processing') || 'Processing')
 : step === 'shipped' ? (t('shipped') || 'Shipped')
 : step === 'out_for_delivery' ? (t('out_delivery') || 'Out for Delivery')
 : (t('delivered') || 'Delivered')}
 </span>
 </div>
 ))}
 </div>

 {/* Event Log */}
 <div className={styles.eventLog}>
 <h3>{t('tracking_history') || 'Tracking History'}</h3>
 {order.tracking.map(event => (
 <div key={event.id} className={styles.eventItem}>
 <div className={styles.eventDot} />
 <div className={styles.eventInfo}>
 <strong>{getLabel(event)}</strong>
 {event.location && <small>{event.location}</small>}
 <small>{new Date(event.timestamp).toLocaleString(locale === 'fr' ? 'fr-FR' : 'en-US')}</small>
 </div>
 </div>
 ))}
 </div>
 </div>
 </div>

 {/* Map + Details */}
 <div className={styles.detailsSection}>
 {/* Animated Map */}
 <div className={styles.card}>
 <h3>{t('delivery_map') || 'Delivery Progress'}</h3>
 <div className={styles.map}>
 <div className={styles.mapRoute}>
 <div className={styles.mapProgress} style={{ width: `${mapProgress}%` }} />
 <div className={styles.mapPin} style={{ left: `${mapProgress}%` }}>🛵</div>
 </div>
 <div className={styles.mapLabels}>
 <span>{t('warehouse') || 'Warehouse'}</span>
 <span>{t('your_address') || 'Your Address'}</span>
 </div>
 </div>
 </div>

 {/* Order Items */}
 <div className={styles.card}>
 <h3>{t('order_items') || 'Order Items'}</h3>
 <div className={styles.orderItems}>
 {order.items.map(item => (
 <div key={item.id} className={styles.orderItem}>
 <div className={styles.itemInfo}>
 <strong>{item.productName}</strong>
 {item.variantName && <small>{item.variantName}</small>}
 </div>
 <div className={styles.itemQty}>x{item.quantity}</div>
 <div className={styles.itemPrice}>${item.totalPrice.toFixed(2)}</div>
 </div>
 ))}
 </div>

 <div className={styles.orderTotals}>
 <div className={styles.totalRow}><span>{t('subtotal') || 'Subtotal'}</span><span>${order.subtotal.toFixed(2)}</span></div>
 <div className={styles.totalRow}><span>{t('shipping') || 'Shipping'}</span><span>{order.shippingCost === 0 ? 'FREE' : `$${order.shippingCost.toFixed(2)}`}</span></div>
 <div className={styles.totalRow}><span>{t('tax') || 'Tax'}</span><span>${order.tax.toFixed(2)}</span></div>
 <div className={`${styles.totalRow} ${styles.totalFinal}`}><span>{t('total') || 'Total'}</span><span>${order.total.toFixed(2)}</span></div>
 </div>
 </div>

 {/* Invoice */}
 {order.invoices.length > 0 && (
 <div className={styles.card}>
 <h3>📄 {t('invoices') || 'Invoices'}</h3>
 {order.invoices.map(inv => (
 <div key={inv.invoiceNumber} className={styles.invoiceItem}>
 <span>{inv.type === 'proforma' ? '📋 Proforma' : '📄 Final'}</span>
 <span>{inv.invoiceNumber}</span>
 </div>
 ))}
 </div>
 )}

 {/* Payment */}
 <div className={styles.card}>
 <h3>{t('payment') || 'Payment'}</h3>
 <div className={styles.paymentInfo}>
 <div><span>{t('method') || 'Method'}</span><strong>{order.paymentMethod === 'cod' ? (t('cash_delivery') || 'Cash on Delivery') : (t('credit_card') || 'Credit Card')}</strong></div>
 <div><span>{t('status') || 'Status'}</span><strong className={order.paymentStatus === 'paid' ? styles.paid : styles.pending}>{order.paymentStatus.toUpperCase()}</strong></div>
 </div>
 </div>
 </div>
 </div>
 )}

 {/* No order searched yet */}
 {!order && !loading && !error && (
 <div className={styles.placeholder}>
 <span className={styles.placeholderIcon}></span>
 <h2>{t('enter_order_prompt') || 'Enter your order number to track delivery'}</h2>
 <p>{t('tracking_description') || 'Get real-time updates on your shipment location and estimated delivery time'}</p>
 <div className={styles.features}>
 <div className={styles.feature}><span>🗺️</span>{t('live_tracking') || 'Live Map Tracking'}</div>
 <div className={styles.feature}>{t('real_time') || 'Real-time Updates'}</div>
 <div className={styles.feature}><span>📄</span>{t('invoices') || 'Invoice Download'}</div>
 </div>
 </div>
 )}
 </main>
 );
}
