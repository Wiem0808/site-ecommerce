'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useI18n } from '@/context/I18nContext';
import {
  User, ShoppingBag, MapPin, Settings, LogOut, Package,
  Heart, ChevronRight, Shield, Save, Check, AlertCircle,
} from 'lucide-react';
import styles from './page.module.css';

type Tab = 'overview' | 'orders' | 'profile' | 'settings';

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  createdAt: string;
  items: { id: string; productName: string; quantity: number }[];
}

export default function AccountPage() {
  const router = useRouter();
  const { user, token, isLoading, isAdmin, logout, updateUser } = useAuth();
  const { t, locale } = useI18n();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [profileData, setProfileData] = useState({ name: '', email: '', phone: '' });
  const [passwordData, setPasswordData] = useState({ current: '', newPw: '', confirm: '' });
  const [saveMsg, setSaveMsg] = useState('');
  const [saveError, setSaveError] = useState('');

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth?redirect=/account');
    }
  }, [isLoading, user, router]);

  // Load user data into form
  useEffect(() => {
    if (user) {
      setProfileData({ name: user.name, email: user.email, phone: user.phone || '' });
    }
  }, [user]);

  // Load orders on mount
  useEffect(() => {
    if (user && token) {
      loadOrders();
    }
  }, [user, token]);

  const loadOrders = async () => {
    setOrdersLoading(true);
    try {
      const res = await fetch('/api/orders?userId=' + user?.id, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch {
      /* silently fail */
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveMsg('');
    setSaveError('');
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: profileData.name, phone: profileData.phone }),
      });
      if (res.ok) {
        const data = await res.json();
        updateUser(data.user);
        setSaveMsg(t('account.saved_ok'));
        setTimeout(() => setSaveMsg(''), 3000);
      } else {
        setSaveError(t('account.save_err'));
      }
    } catch {
      setSaveError(t('account.net_err'));
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveMsg('');
    setSaveError('');
    if (passwordData.newPw !== passwordData.confirm) {
      setSaveError(t('account.pw_mismatch'));
      return;
    }
    if (passwordData.newPw.length < 6) {
      setSaveError(t('auth.err_pw_length'));
      return;
    }
    try {
      const res = await fetch('/api/auth/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: passwordData.current,
          newPassword: passwordData.newPw,
        }),
      });
      if (res.ok) {
        setSaveMsg(t('account.pw_changed'));
        setPasswordData({ current: '', newPw: '', confirm: '' });
        setTimeout(() => setSaveMsg(''), 3000);
      } else {
        const data = await res.json();
        setSaveError(data.error || t('account.pw_current_err'));
      }
    } catch {
      setSaveError(t('account.net_err'));
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const getStatusClass = (status: string) => {
    if (status === 'delivered') return styles.statusDelivered;
    if (status === 'shipped' || status === 'out_for_delivery') return styles.statusShipped;
    if (status === 'cancelled') return styles.statusCancelled;
    return styles.statusPending;
  };

  const getStatusLabel = (status: string) => {
    const key = `status.${status}` as const;
    return t(key) || status;
  };

  const formatDate = (dateStr: string) => {
    const localeMap: Record<string, string> = {
      fr: 'fr-FR', en: 'en-US', ar: 'ar-DZ', es: 'es-ES', pt: 'pt-BR',
    };
    return new Date(dateStr).toLocaleDateString(localeMap[locale] || 'fr-FR', {
      day: 'numeric', month: 'long', year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingSpinner} />
      </div>
    );
  }

  if (!user) return null;

  const initials = user.name.split(' ').map(n => n[0]).join('').slice(0, 2);

  const tabs = [
    { key: 'overview' as Tab, label: t('account.tab_overview'), icon: <Package size={16} /> },
    { key: 'orders'   as Tab, label: t('account.tab_orders'),   icon: <ShoppingBag size={16} /> },
    { key: 'profile'  as Tab, label: t('account.tab_profile'),  icon: <User size={16} /> },
    { key: 'settings' as Tab, label: t('account.tab_settings'), icon: <Settings size={16} /> },
  ];

  const stats = [
    { value: orders.length || 0,                                                              label: t('account.stat_orders'),    color: 'rgba(108,92,231,0.12)', iconColor: '#a29bfe', icon: <ShoppingBag size={22} /> },
    { value: orders.filter(o => o.status === 'delivered').length,                             label: t('account.stat_delivered'), color: 'rgba(0,184,148,0.12)',   iconColor: '#00b894', icon: <Check size={22} /> },
    { value: orders.filter(o => o.status === 'shipped' || o.status === 'out_for_delivery').length, label: t('account.stat_pending'), color: 'rgba(253,203,110,0.12)', iconColor: '#fdcb6e', icon: <Package size={22} /> },
    { value: 0,                                                                               label: t('account.stat_favorites'), color: 'rgba(255,158,202,0.12)', iconColor: '#ff9eca', icon: <Heart size={22} /> },
  ];

  return (
    <div className={styles.accountPage}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.avatar}>{initials}</div>
          <div className={styles.headerInfo}>
            <h1>{user.name}</h1>
            <p>{user.email}</p>
            <span className={`${styles.roleBadge} ${isAdmin ? styles.roleAdmin : styles.roleCustomer}`}>
              {isAdmin ? (
                <><Shield size={12} /> {t('account.admin_badge')}</>
              ) : (
                <><User size={12} /> {t('account.client_badge')}</>
              )}
            </span>
          </div>
        </div>
        <button className={styles.logoutBtn} onClick={handleLogout}>
          <LogOut size={16} />
          {t('account.logout')}
        </button>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        {tabs.map(tab => (
          <button
            key={tab.key}
            className={`${styles.tabBtn} ${activeTab === tab.key ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className={styles.content}>
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            <div className={styles.statsGrid}>
              {stats.map((stat, i) => (
                <div className={styles.statCard} key={i}>
                  <div className={styles.statIcon} style={{ background: stat.color, color: stat.iconColor }}>
                    {stat.icon}
                  </div>
                  <div>
                    <div className={styles.statValue}>{stat.value}</div>
                    <div className={styles.statLabel}>{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Admin Quick Access */}
            {isAdmin && (
              <div className={styles.adminCard}>
                <div className={styles.adminCardContent}>
                  <div className={styles.adminCardIcon}>
                    <Shield size={24} />
                  </div>
                  <div className={styles.adminCardText}>
                    <h3>{t('account.admin_panel')}</h3>
                    <p>{t('account.admin_desc')}</p>
                  </div>
                </div>
                <Link href="/admin" className={styles.adminCardBtn}>
                  {t('account.admin_access')} <ChevronRight size={16} />
                </Link>
              </div>
            )}
          </>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className={styles.ordersList}>
            {ordersLoading ? (
              <div className={styles.loading}><div className={styles.loadingSpinner} /></div>
            ) : orders.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}><ShoppingBag size={28} /></div>
                <h3>{t('account.no_orders')}</h3>
                <p>{t('account.no_orders_desc')}</p>
                <Link href="/catalogue" className="btn btn-primary" style={{ marginTop: '16px', display: 'inline-flex' }}>
                  {t('account.discover')} <ChevronRight size={16} />
                </Link>
              </div>
            ) : (
              orders.map(order => (
                <div key={order.id} className={styles.orderCard}>
                  <div className={styles.orderInfo}>
                    <div className={styles.orderNumber}>#{order.orderNumber}</div>
                    <div className={styles.orderDate}>{formatDate(order.createdAt)}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      {order.items?.length || 0}{' '}
                      {(order.items?.length || 0) > 1 ? t('account.articles') : t('account.article')}
                    </div>
                  </div>
                  <div className={styles.orderMeta}>
                    <span className={styles.orderTotal}>${order.total.toFixed(2)}</span>
                    <span className={`${styles.orderStatus} ${getStatusClass(order.status)}`}>
                      {getStatusLabel(order.status)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className={styles.profileSection}>
            <div className={styles.profileCard}>
              <h3><User size={20} /> {t('account.personal_info')}</h3>

              {saveMsg && (
                <div style={{
                  background: 'rgba(0,184,148,0.08)', color: 'var(--color-success)',
                  padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem',
                  marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px',
                }}>
                  <Check size={16} /> {saveMsg}
                </div>
              )}

              {saveError && (
                <div style={{
                  background: 'rgba(255,110,132,0.08)', color: 'var(--color-error)',
                  padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem',
                  marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px',
                }}>
                  <AlertCircle size={16} /> {saveError}
                </div>
              )}

              <form onSubmit={handleSaveProfile}>
                <div className={styles.formGroup}>
                  <label>{t('full_name')}</label>
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={e => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>{t('email')}</label>
                  <input type="email" value={profileData.email} disabled style={{ opacity: 0.6 }} />
                </div>
                <div className={styles.formGroup}>
                  <label>{t('phone')}</label>
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={e => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+213 XX XX XX XX"
                  />
                </div>
                <button type="submit" className={styles.saveBtn}>
                  <Save size={16} /> {t('account.save')}
                </button>
              </form>
            </div>

            <div className={styles.profileCard}>
              <h3><MapPin size={20} /> {t('account.change_pw_title')}</h3>
              <form onSubmit={handleChangePassword}>
                <div className={styles.formGroup}>
                  <label>{t('account.current_pw')}</label>
                  <input
                    type="password"
                    value={passwordData.current}
                    onChange={e => setPasswordData(prev => ({ ...prev, current: e.target.value }))}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>{t('account.new_pw')}</label>
                  <input
                    type="password"
                    value={passwordData.newPw}
                    onChange={e => setPasswordData(prev => ({ ...prev, newPw: e.target.value }))}
                    required
                    minLength={6}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>{t('account.confirm_pw')}</label>
                  <input
                    type="password"
                    value={passwordData.confirm}
                    onChange={e => setPasswordData(prev => ({ ...prev, confirm: e.target.value }))}
                    required
                  />
                </div>
                <button type="submit" className={styles.saveBtn}>
                  <Save size={16} /> {t('account.change_pw_btn')}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className={styles.profileSection}>
            <div className={styles.profileCard}>
              <h3><Settings size={20} /> {t('account.prefs_title')}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.7 }}>
                {t('account.prefs_desc')}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
